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
      isHandledRef.current = false;
      notFoundCountRef.current = 0;
      attemptsRef.current = 0;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(async () => {
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
          const res = await dispatch(checkStatus(authReqId));

          if (res.meta.requestStatus === "rejected") {
            const errorPayload = res.payload || {};
            if (errorPayload.error === "not_found") {
              notFoundCountRef.current += 1;
              console.warn(
                `checkStatus 404 (not_found) ${notFoundCountRef.current}/${MAX_NOT_FOUND_IN_A_ROW}`
              );
              if (notFoundCountRef.current >= MAX_NOT_FOUND_IN_A_ROW) {
                isHandledRef.current = true;
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                onError?.({ status: "not_found", canRetry: true });
              }
              return;
            }
            console.warn("checkStatus rejected, продолжаем polling...");
            return;
          }

          notFoundCountRef.current = 0;
          const { status, can_retry } = res.payload || {};

          if (status === "sms_sent") {
            onSmsRequired?.();
            return;
          }

          if (status === "success") {
            isHandledRef.current = true;
            clearInterval(intervalRef.current);
            intervalRef.current = null;

            // finalize → fetchMe с ретраями. dispatch(finalizeAuth) не
            // бросает при rejected — нужно проверять requestStatus явно,
            // иначе fetchMe вызовется без cookie и упадёт 401, а юзер
            // получит «finalize_error» без видимого ответа.
            const tryLogin = async () => {
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
                console.warn(
                  `[polling] fetchMe attempt ${attempt} rejected:`,
                  me.payload
                );
                await new Promise((r) => setTimeout(r, 500));
              }
              return false;
            };

            try {
              const ok = await tryLogin();
              if (ok) onSuccess?.();
              else throw new Error("finalize/fetchMe failed after retries");
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
          console.warn("Polling error (продолжаем):", error.message);
        }
      }, 2000);
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
