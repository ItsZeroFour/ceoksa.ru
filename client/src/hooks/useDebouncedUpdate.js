import { useRef, useEffect, useCallback } from "react";

export const useDebouncedUpdate = (callback, delay = 2000) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedUpdate = useCallback(
    (data) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(data);
      }, delay);
    },
    [delay]
  );

  return debouncedUpdate;
};
