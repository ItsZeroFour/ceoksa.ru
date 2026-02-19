import { useState, useRef, useCallback } from "react";

export const useCodeInput = (length = 4) => {
  const [code, setCode] = useState(Array(length).fill(""));
  const [hasError, setHasError] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = useCallback(
    (index, value) => {
      if (value.length > 1) {
        const digits = value.replace(/\D/g, "").split("").slice(0, length);
        if (!digits.length) return;

        setCode((prev) => {
          const newCode = [...prev];
          digits.forEach((d, i) => {
            if (index + i < length) newCode[index + i] = d;
          });
          return newCode;
        });

        setHasError(false);

        const focusIndex = Math.min(index + digits.length - 1, length - 1);
        inputRefs.current[focusIndex]?.focus();
        return;
      }

      if (!/^\d?$/.test(value)) return;

      setCode((prev) => {
        const newCode = [...prev];
        newCode[index] = value;
        return newCode;
      });

      setHasError(false);

      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [length]
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
        setCode(newCode);
        setHasError(false);

        const focusIndex = Math.min(pasted.length - 1, length - 1);
        inputRefs.current[focusIndex]?.focus();
      }
    },
    [length]
  );

  const isComplete = code.every((digit) => digit !== "");

  const getCode = () => code.join("");

  const reset = useCallback(() => {
    setCode(Array(length).fill(""));
    setHasError(false);
    inputRefs.current[0]?.focus();
  }, [length]);

  const setError = useCallback(() => {
    setHasError(true);
  }, []);

  return {
    code,
    hasError,
    inputRefs,
    isComplete,
    handleChange,
    handleKeyDown,
    handlePaste,
    getCode,
    reset,
    setError,
  };
};
