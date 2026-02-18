import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  checkStatus,
  finalizeAuth,
} from "../redux/slices/auth/mobileAuthSlice";
import { fetchMe } from "../redux/slices/auth/authSlice";

export const useAuthPolling = ({ onSuccess, onError }) => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  const startPolling = useCallback(
    (authReqId) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(async () => {
        try {
          const res = await dispatch(checkStatus(authReqId));
          const status = res.payload?.status;

          if (status === "success") {
            clearInterval(intervalRef.current);
            intervalRef.current = null;

            await dispatch(finalizeAuth(authReqId));

            await new Promise((resolve) => setTimeout(resolve, 300));

            const me = await dispatch(fetchMe());

            if (me.meta.requestStatus === "fulfilled") {
              onSuccess?.();
            } else {
              throw new Error("fetchMe failed after finalize");
            }
          }

          if (status === "failed" || status === "expired") {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            onError?.(status);
          }
        } catch (error) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          onError?.(error);
        }
      }, 2000);
    },
    [dispatch, onSuccess, onError]
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { startPolling, stopPolling };
};
