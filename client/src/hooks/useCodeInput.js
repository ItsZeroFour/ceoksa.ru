import { useState, useRef, useCallback } from "react";

export const useCodeInput = (length = 4, onComplete) => {
  const [code, setCode] = useState(Array(length).fill(""));
  const [hasError, setHasError] = useState(false);
  const inputRefs = useRef([]);
  const codeRef = useRef(Array(length).fill(""));
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  onCompleteRef.current = onComplete;

  const checkAndTriggerComplete = useCallback(
    (newCode) => {
      const isFull = newCode.every((d) => d !== "");
      if (isFull && !completedRef.current) {
        completedRef.current = true;

        setTimeout(() => {
          const currentCode = codeRef.current.join("");
          if (currentCode.length === length && /^\d+$/.test(currentCode)) {
            onCompleteRef.current?.(currentCode);
          }
        }, 50);
      }
    },
    [length]
  );

  const updateCode = useCallback((updater) => {
    setCode((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      codeRef.current = next;
      return next;
    });
  }, []);

  const handleChange = useCallback(
    (index, value) => {
      if (value.length > 1) {
        const digits = value.replace(/\D/g, "").split("").slice(0, length);
        if (!digits.length) return;

        let newCode;
        updateCode((prev) => {
          newCode = [...prev];
          digits.forEach((d, i) => {
            if (index + i < length) newCode[index + i] = d;
          });
          return newCode;
        });

        setHasError(false);

        const focusIndex = Math.min(index + digits.length - 1, length - 1);
        inputRefs.current[focusIndex]?.focus();

        setTimeout(() => checkAndTriggerComplete(codeRef.current), 0);
        return;
      }

      if (!/^\d?$/.test(value)) return;

      updateCode((prev) => {
        const newCode = [...prev];
        newCode[index] = value;
        return newCode;
      });

      setHasError(false);

      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      setTimeout(() => checkAndTriggerComplete(codeRef.current), 0);
    },
    [length, updateCode, checkAndTriggerComplete]
  );

  const handleKeyDown = useCallback(
    (index, e) => {
      if (e.key === "Backspace" && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [code]
  );

  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, length);

      if (pasted) {
        const newCode = Array(length).fill("");
        for (let i = 0; i < pasted.length; i++) {
          newCode[i] = pasted[i];
        }

        updateCode(newCode);
        setHasError(false);

        const focusIndex = Math.min(pasted.length - 1, length - 1);
        inputRefs.current[focusIndex]?.focus();

        setTimeout(() => checkAndTriggerComplete(codeRef.current), 0);
      }
    },
    [length, updateCode, checkAndTriggerComplete]
  );

  const isComplete = code.every((digit) => digit !== "");

  const getIsComplete = useCallback(
    () => codeRef.current.every((d) => d !== ""),
    []
  );

  const getCode = useCallback(() => codeRef.current.join(""), []);

  const reset = useCallback(() => {
    const empty = Array(length).fill("");
    codeRef.current = empty;
    completedRef.current = false;
    setCode(empty);
    setHasError(false);
    inputRefs.current[0]?.focus();
  }, [length]);

  const setError = useCallback(() => {
    setHasError(true);
  }, []);

  const clearError = useCallback(() => {
    setHasError(false);
  }, []);

  return {
    code,
    hasError,
    inputRefs,
    isComplete,
    getIsComplete,
    handleChange,
    handleKeyDown,
    handlePaste,
    getCode,
    reset,
    setError,
    clearError,
  };
};
