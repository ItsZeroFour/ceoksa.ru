import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  checkStatus,
  finalizeAuth,
} from "../redux/slices/auth/mobileAuthSlice";
import { fetchMe } from "../redux/slices/auth/authSlice";

const MAX_NOT_FOUND_IN_A_ROW = 5;
const MAX_POLL_ATTEMPTS = 90;

export const useAuthPolling = ({ onSuccess, onError, onSmsRequired }) => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);
  const isHandledRef = useRef(false);
  const notFoundCountRef = useRef(0);
  const attemptsRef = useRef(0);

  const startPolling = useCallback(
    (authReqId) => {
      console.log("[useAuthPolling] startPolling вызван. authReqId:", authReqId);

      if (!authReqId) {
        console.error("[useAuthPolling] startPolling: authReqId пустой, polling не запущен");
        return;
      }

      isHandledRef.current = false;
      notFoundCountRef.current = 0;
      attemptsRef.current = 0;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const tick = async () => {
        if (isHandledRef.current) return;

        attemptsRef.current += 1;
        if (attemptsRef.current > MAX_POLL_ATTEMPTS) {
          isHandledRef.current = true;
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          onError?.({ status: "expired", canRetry: true });
          return;
        }

        try {
          console.log(
            `[useAuthPolling] tick #${attemptsRef.current} → checkStatus(${authReqId})`
          );
          const res = await dispatch(checkStatus(authReqId));

          if (res.meta.requestStatus === "rejected") {
            const errorPayload = res.payload || {};
            console.warn("[useAuthPolling] rejected payload:", errorPayload);
            if (errorPayload.error === "not_found") {
              notFoundCountRef.current += 1;
              if (notFoundCountRef.current >= MAX_NOT_FOUND_IN_A_ROW) {
                isHandledRef.current = true;
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                onError?.({ status: "not_found", canRetry: true });
              }
              return;
            }
            return;
          }

          notFoundCountRef.current = 0;
          const { status, can_retry } = res.payload || {};
          console.log(`[useAuthPolling] статус из БД: ${status}`);

          if (status === "sms_sent") {
            onSmsRequired?.();
            return;
          }

          if (status === "success") {
            isHandledRef.current = true;
            clearInterval(intervalRef.current);
            intervalRef.current = null;

            try {
              await dispatch(finalizeAuth(authReqId));
              await new Promise((resolve) => setTimeout(resolve, 300));
              const me = await dispatch(fetchMe());

              if (me.meta.requestStatus === "fulfilled") {
                onSuccess?.();
              } else {
                throw new Error("fetchMe failed after finalize");
              }
            } catch (finalizeError) {
              console.error("Ошибка финализации:", finalizeError);
              onError?.({ status: "finalize_error", canRetry: false });
            }
          }

          if (status === "failed") {
            isHandledRef.current = true;
            clearInterval(intervalRef.current);
            intervalRef.current = null;

            onError?.({ status: "failed", canRetry: can_retry || false });
          }

          if (status === "expired") {
            isHandledRef.current = true;
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            onError?.({ status: "expired", canRetry: true });
          }
        } catch (error) {
          console.warn("[useAuthPolling] Polling error (продолжаем):", error.message);
        }
      };

      // первый тик мгновенный — чтобы не ждать 2 сек, если notification уже пришёл
      tick();
      intervalRef.current = setInterval(tick, 2000);
    },
    [dispatch, onSuccess, onError, onSmsRequired]
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { startPolling, stopPolling };
};
