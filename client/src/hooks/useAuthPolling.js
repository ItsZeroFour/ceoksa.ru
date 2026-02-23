import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  checkStatus,
  finalizeAuth,
} from "../redux/slices/auth/mobileAuthSlice";
import { fetchMe } from "../redux/slices/auth/authSlice";

export const useAuthPolling = ({ onSuccess, onError, onSmsRequired }) => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);
  const isHandledRef = useRef(false);

  const startPolling = useCallback(
    (authReqId) => {
      isHandledRef.current = false;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(async () => {
        if (isHandledRef.current) return;

        try {
          const res = await dispatch(checkStatus(authReqId));

          if (res.meta.requestStatus === "rejected") {
            console.warn("checkStatus rejected, продолжаем polling...");
            return;
          }

          const { status, can_retry } = res.payload || {};

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
