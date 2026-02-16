import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { checkStatus } from "../redux/slices/auth/mobileAuthSlice";
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

          if (res.payload?.status === "success") {
            clearInterval(intervalRef.current);
            intervalRef.current = null;

            await axios.get(
              `${process.env.REACT_APP_SERVERF_API}/auth/complete?auth_req_id=${authReqId}`,
              { withCredentials: true },
            );

            await dispatch(fetchMe());
            onSuccess?.();
          }

          if (res.payload?.status === "failed") {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            onError?.();
          }
        } catch (error) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          onError?.(error);
        }
      }, 2000);
    },
    [dispatch, onSuccess, onError],
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { startPolling, stopPolling };
};
