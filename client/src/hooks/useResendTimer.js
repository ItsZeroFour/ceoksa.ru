import { useState, useEffect, useCallback } from "react";

export const useResendTimer = (initialTime = 60) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (!isDisabled || timeLeft === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsDisabled(false);
          return initialTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isDisabled, timeLeft, initialTime]);

  const start = useCallback(() => {
    setIsDisabled(true);
    setTimeLeft(initialTime);
  }, [initialTime]);

  const reset = useCallback(() => {
    setIsDisabled(false);
    setTimeLeft(initialTime);
  }, [initialTime]);

  return {
    isDisabled,
    timeLeft,
    start,
    reset,
  };
};
