import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  checkStatus,
  finalizeAuth,
} from "../redux/slices/auth/mobileAuthSlice";
import { fetchMe } from "../redux/slices/auth/authSlice";

const MAX_NOT_FOUND_IN_A_ROW = 5;
const MAX_TOTAL_DURATION_MS = 4 * 60 * 1000; // 4 минуты на весь polling

// Polling работает в рекурсивной модели: после каждого ответа сервера
// сразу планируется следующий запрос. Сервер сам long-poll'ит до 25 сек
// (controllers/MobileControllers.js → checkAuthStatus), поэтому накладные
// расходы минимальные, и нет зависимости от setInterval, который иногда
// "теряется" в некоторых браузерных кейсах.
export const useAuthPolling = ({ onSuccess, onError, onSmsRequired }) => {
  const dispatch = useDispatch();
  const isHandledRef = useRef(false);
  const notFoundCountRef = useRef(0);
  const startTimeRef = useRef(0);
  const tokenRef = useRef(0);

  const startPolling = useCallback(
    (authReqId) => {
      console.log("[useAuthPolling] startPolling вызван. authReqId:", authReqId);

      if (!authReqId) {
        console.error(
          "[useAuthPolling] startPolling: authReqId пустой, polling не запущен"
        );
        return;
      }

      isHandledRef.current = false;
      notFoundCountRef.current = 0;
      startTimeRef.current = Date.now();
      tokenRef.current += 1;
      const myToken = tokenRef.current;

      const stop = (reason) => {
        isHandledRef.current = true;
        console.log(`[useAuthPolling] stop: ${reason}`);
      };

      const loop = async () => {
        let iteration = 0;
        while (!isHandledRef.current && tokenRef.current === myToken) {
          iteration += 1;

          if (Date.now() - startTimeRef.current > MAX_TOTAL_DURATION_MS) {
            stop("превышен общий таймаут");
            onError?.({ status: "expired", canRetry: true });
            return;
          }

          try {
            console.log(
              `[useAuthPolling] tick #${iteration} → checkStatus(${authReqId})`
            );
            const res = await dispatch(checkStatus(authReqId));

            if (tokenRef.current !== myToken || isHandledRef.current) return;

            if (res.meta.requestStatus === "rejected") {
              const errorPayload = res.payload || {};
              console.warn("[useAuthPolling] rejected payload:", errorPayload);
              if (errorPayload.error === "not_found") {
                notFoundCountRef.current += 1;
                if (notFoundCountRef.current >= MAX_NOT_FOUND_IN_A_ROW) {
                  stop("not_found x" + MAX_NOT_FOUND_IN_A_ROW);
                  onError?.({ status: "not_found", canRetry: true });
                  return;
                }
              }
              await new Promise((r) => setTimeout(r, 1500));
              continue;
            }

            notFoundCountRef.current = 0;
            const { status, can_retry } = res.payload || {};
            console.log(`[useAuthPolling] статус из БД: ${status}`);

            if (status === "success") {
              stop("success");
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
              return;
            }

            if (status === "failed") {
              stop("failed");
              onError?.({ status: "failed", canRetry: can_retry || false });
              return;
            }

            if (status === "expired") {
              stop("expired");
              onError?.({ status: "expired", canRetry: true });
              return;
            }

            if (status === "sms_sent") {
              onSmsRequired?.();
            }

            // status === pending | sms_sent | verifying → следующий запрос
            // без задержки (сервер уже long-poll'ит)
          } catch (error) {
            console.warn(
              "[useAuthPolling] Polling error (продолжаем):",
              error.message
            );
            await new Promise((r) => setTimeout(r, 1500));
          }
        }
      };

      loop();
    },
    [dispatch, onSuccess, onError, onSmsRequired]
  );

  const stopPolling = useCallback(() => {
    isHandledRef.current = true;
    tokenRef.current += 1; // инвалидирует текущий loop
  }, []);

  return { startPolling, stopPolling };
};
