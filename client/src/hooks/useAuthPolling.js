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
// Минимальная задержка между запросами (для не-long-poll ответов).
const POLL_MIN_GAP_MS = 800;
// Задержка после rejected, чтобы не задудосить сервер.
const POLL_BACKOFF_MS = 1500;

export const useAuthPolling = ({ onSuccess, onError, onSmsRequired }) => {
  const dispatch = useDispatch();
  const stoppedRef = useRef(false);
  const isHandledRef = useRef(false);
  const notFoundCountRef = useRef(0);
  const deadlineRef = useRef(0);
  // smsScreenShownRef — чтобы не дёргать onSmsRequired повторно
  // при каждом тике polling после первого срабатывания.
  const smsScreenShownRef = useRef(false);
  // Текущий «запущенный поллинг» помечается id'шником — это позволяет
  // безопасно прервать старый цикл при перезапуске polling
  // (например, после handleResendCode → новый auth_req_id).
  const pollIdRef = useRef(0);

  const finish = useCallback(() => {
    stoppedRef.current = true;
    isHandledRef.current = true;
  }, []);

  const startPolling = useCallback(
    (authReqId) => {
      stoppedRef.current = false;
      isHandledRef.current = false;
      notFoundCountRef.current = 0;
      smsScreenShownRef.current = false;
      deadlineRef.current = Date.now() + POLL_DEADLINE_MS;
      pollIdRef.current += 1;
      const myPollId = pollIdRef.current;

      const loop = async () => {
        console.log(`[poll] start ${authReqId.slice(0, 8)} (id=${myPollId})`);
        let iter = 0;
        while (
          !stoppedRef.current &&
          !isHandledRef.current &&
          pollIdRef.current === myPollId
        ) {
          iter += 1;
          console.log(`[poll] iter#${iter} (id=${myPollId})`);
          if (Date.now() > deadlineRef.current) {
            isHandledRef.current = true;
            onError?.({ status: "expired", canRetry: true });
            return;
          }

          const startedAt = Date.now();
          let res;
          try {
            res = await dispatch(checkStatus(authReqId));
          } catch (e) {
            console.warn("Polling exception (продолжаем):", e?.message);
            await sleep(POLL_BACKOFF_MS);
            continue;
          }

          if (
            stoppedRef.current ||
            isHandledRef.current ||
            pollIdRef.current !== myPollId
          ) {
            return;
          }

          if (res.meta.requestStatus === "rejected") {
            const errorPayload = res.payload || {};
            if (errorPayload.error === "not_found") {
              notFoundCountRef.current += 1;
              console.warn(
                `checkStatus 404 (not_found) ${notFoundCountRef.current}/${MAX_NOT_FOUND_IN_A_ROW}`
              );
              if (notFoundCountRef.current >= MAX_NOT_FOUND_IN_A_ROW) {
                isHandledRef.current = true;
                onError?.({ status: "not_found", canRetry: true });
                return;
              }
              await sleep(POLL_BACKOFF_MS);
              continue;
            }
            console.warn("checkStatus rejected, продолжаем polling...");
            await sleep(POLL_BACKOFF_MS);
            continue;
          }

          notFoundCountRef.current = 0;
          const { status, can_retry } = res.payload || {};
          console.log(`[poll] ${authReqId.slice(0, 8)} → ${status}`);

          // push_failed: PUSH не доставлен/отклонён — переключаем экран на SMS
          // (idle-state «ожидаем SMS»). Polling продолжается до sms_sent / failed.
          if (status === "push_failed") {
            if (!smsScreenShownRef.current) {
              smsScreenShownRef.current = true;
              onSmsRequired?.({ waitingForSms: true });
            }
            await gapTo(startedAt);
            continue;
          }

          if (status === "sms_sent") {
            smsScreenShownRef.current = true;
            onSmsRequired?.({ waitingForSms: false });
            await gapTo(startedAt);
            continue;
          }

          if (status === "success") {
            isHandledRef.current = true;
            // finalize → fetchMe с ретраями. dispatch(finalizeAuth) не
            // бросает при rejected — нужно проверять requestStatus явно,
            // иначе fetchMe вызовется без cookie и упадёт 401, а юзер
            // получит «finalize_error» без видимого ответа.
            const ok = await tryLogin(dispatch, authReqId);
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

          // pending / verifying — ждём дальше.
          await gapTo(startedAt);
        }
        console.log(
          `[poll] loop EXIT (id=${myPollId}, stopped=${stoppedRef.current}, handled=${isHandledRef.current}, currentId=${pollIdRef.current})`
        );
      };

      loop().catch((e) => {
        console.error("[useAuthPolling] loop crashed:", e);
      });
    },
    [dispatch, onSuccess, onError, onSmsRequired]
  );

  const stopPolling = useCallback(() => {
    stoppedRef.current = true;
    pollIdRef.current += 1; // инвалидируем текущий цикл
  }, []);

  return { startPolling, stopPolling };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Если ответ пришёл слишком быстро (без long-poll, скажем 50мс),
// не хлестать сервер — выдержать минимальный интервал между запросами.
const gapTo = async (startedAt) => {
  const elapsed = Date.now() - startedAt;
  if (elapsed < POLL_MIN_GAP_MS) {
    await sleep(POLL_MIN_GAP_MS - elapsed);
  }
};

const tryLogin = async (dispatch, authReqId) => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const fin = await dispatch(finalizeAuth(authReqId));
    if (fin.meta.requestStatus !== "fulfilled") {
      console.warn(
        `[polling] finalizeAuth attempt ${attempt} rejected:`,
        fin.payload
      );
      await sleep(500);
      continue;
    }
    await sleep(200);
    const me = await dispatch(fetchMe());
    if (me.meta.requestStatus === "fulfilled") return true;
    console.warn(`[polling] fetchMe attempt ${attempt} rejected:`, me.payload);
    await sleep(500);
  }
  return false;
};
