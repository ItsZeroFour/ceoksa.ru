import { useRef, useEffect } from "react";

export const useDebouncedUpdate = (callback, delay = 3000) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedUpdate = (data) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(data);
    }, delay);
  };

  return debouncedUpdate;
};