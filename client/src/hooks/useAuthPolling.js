import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  checkStatus,
  finalizeAuth,
} from "../redux/slices/auth/mobileAuthSlice";
import { fetchMe } from "../redux/slices/auth/authSlice";

const MAX_NOT_FOUND_IN_A_ROW = 5;
// Жёсткий лимит времени поллинга (с запасом к expires_in=140с от МТС).
const POLL_DEADLINE_MS = 150_000;
// Минимальная задержка между запросами (если ответ пришёл быстрее long-poll).
const POLL_MIN_GAP_MS = 500;
// Задержка после ошибки/rejected.
const POLL_BACKOFF_MS = 1500;

// setTimeout-chain поллинг: каждый тик — независимая итерация event loop.
// Это устойчивее, чем длинный while-loop внутри одной async-функции
// (в т.ч. к подвисанию dispatch/axios, к re-render'ам и stale-closure
// проблемам). Внутреннее состояние держится в refs, поэтому переходы между
// itererациями переживают любой React-цикл.
export const useAuthPolling = ({ onSuccess, onError, onSmsRequired }) => {
  const dispatch = useDispatch();
  const stoppedRef = useRef(false);
  const isHandledRef = useRef(false);
  const notFoundCountRef = useRef(0);
  const deadlineRef = useRef(0);
  // smsScreenShownRef — чтобы дёргать onSmsRequired({waitingForSms:true})
  // только один раз при первом push_failed.
  const smsScreenShownRef = useRef(false);
  // Идентификатор активного цикла. При новом startPolling/stopPolling
  // инкрементится, чтобы старые отложенные tick-и могли определить,
  // что они устарели и просто завершиться.
  const pollIdRef = useRef(0);
  const timeoutRef = useRef(null);

  const startPolling = useCallback(
    (authReqId) => {
      stoppedRef.current = false;
      isHandledRef.current = false;
      notFoundCountRef.current = 0;
      smsScreenShownRef.current = false;
      deadlineRef.current = Date.now() + POLL_DEADLINE_MS;
      pollIdRef.current += 1;
      const myPollId = pollIdRef.current;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      console.log(`[poll] start ${authReqId.slice(0, 8)} (id=${myPollId})`);

      const scheduleNext = (delayMs) => {
        if (stoppedRef.current || isHandledRef.current) return;
        if (pollIdRef.current !== myPollId) return;
        timeoutRef.current = setTimeout(tick, Math.max(delayMs, 0));
      };

      const tick = async () => {
        if (
          stoppedRef.current ||
          isHandledRef.current ||
          pollIdRef.current !== myPollId
        ) {
          console.log(
            `[poll] tick SKIP (stopped=${stoppedRef.current}, handled=${isHandledRef.current}, idMatch=${pollIdRef.current === myPollId})`
          );
          return;
        }

        if (Date.now() > deadlineRef.current) {
          isHandledRef.current = true;
          console.warn("[poll] deadline reached, error=expired");
          onError?.({ status: "expired", canRetry: true });
          return;
        }

        const startedAt = Date.now();
        let res;
        try {
          res = await dispatch(checkStatus(authReqId));
        } catch (e) {
          console.warn("[poll] dispatch threw:", e?.message);
          scheduleNext(POLL_BACKOFF_MS);
          return;
        }

        if (
          stoppedRef.current ||
          isHandledRef.current ||
          pollIdRef.current !== myPollId
        ) {
          console.log("[poll] tick: stopped after dispatch — exit");
          return;
        }

        if (res.meta.requestStatus === "rejected") {
          const errorPayload = res.payload || {};
          console.warn(
            `[poll] rejected (${errorPayload.error || "network"})`
          );
          if (errorPayload.error === "not_found") {
            notFoundCountRef.current += 1;
            if (notFoundCountRef.current >= MAX_NOT_FOUND_IN_A_ROW) {
              isHandledRef.current = true;
              onError?.({ status: "not_found", canRetry: true });
              return;
            }
          }
          scheduleNext(POLL_BACKOFF_MS);
          return;
        }

        notFoundCountRef.current = 0;
        const { status, can_retry } = res.payload || {};
        const elapsed = Date.now() - startedAt;
        console.log(
          `[poll] ${authReqId.slice(0, 8)} → ${status} (${elapsed}ms)`
        );

        if (status === "push_failed") {
          if (!smsScreenShownRef.current) {
            smsScreenShownRef.current = true;
            onSmsRequired?.({ waitingForSms: true });
          }
          scheduleNext(POLL_MIN_GAP_MS);
          return;
        }

        if (status === "sms_sent") {
          smsScreenShownRef.current = true;
          onSmsRequired?.({ waitingForSms: false });
          scheduleNext(POLL_MIN_GAP_MS);
          return;
        }

        if (status === "success") {
          isHandledRef.current = true;
          const ok = await tryLogin(dispatch, authReqId);
          if (
            stoppedRef.current ||
            pollIdRef.current !== myPollId
          ) {
            return;
          }
          if (ok) onSuccess?.();
          else onError?.({ status: "finalize_error", canRetry: false });
          return;
        }

        if (status === "failed") {
          isHandledRef.current = true;
          onError?.({ status: "failed", canRetry: can_retry || false });
          return;
        }

        if (status === "expired") {
          isHandledRef.current = true;
          onError?.({ status: "expired", canRetry: true });
          return;
        }

        // pending / verifying — следующая итерация после короткого зазора.
        // Если long-poll вернулся почти мгновенно (например, без wait
        // или 304-кешем) — дать паузу POLL_MIN_GAP_MS, иначе сразу.
        scheduleNext(Math.max(POLL_MIN_GAP_MS - elapsed, 0));
      };

      // Первый тик — без задержки.
      timeoutRef.current = setTimeout(tick, 0);
    },
    [dispatch, onSuccess, onError, onSmsRequired]
  );

  const stopPolling = useCallback(() => {
    stoppedRef.current = true;
    pollIdRef.current += 1;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { startPolling, stopPolling };
};

const tryLogin = async (dispatch, authReqId) => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const fin = await dispatch(finalizeAuth(authReqId));
    if (fin.meta.requestStatus !== "fulfilled") {
      console.warn(
        `[polling] finalizeAuth attempt ${attempt} rejected:`,
        fin.payload
      );
      await new Promise((r) => setTimeout(r, 500));
      continue;
    }
    await new Promise((r) => setTimeout(r, 200));
    const me = await dispatch(fetchMe());
    if (me.meta.requestStatus === "fulfilled") return true;
    console.warn(`[polling] fetchMe attempt ${attempt} rejected:`, me.payload);
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
};
