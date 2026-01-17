import { useRef, useEffect, useCallback } from "react";
import IMask from "imask";

export const useIMask = (maskOptions, onAccept) => {
  const inputRef = useRef(null);
  const maskRef = useRef(null);

  const updateValue = useCallback((value) => {
    if (maskRef.current) {
      maskRef.current.typedValue = value;
    }
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (maskRef.current) {
      maskRef.current.destroy();
    }

    maskRef.current = IMask(input, maskOptions);

    const handleAccept = () => {
      const value = maskRef.current ? maskRef.current.value : "";
      if (onAccept) onAccept(value);
    };

    maskRef.current.on("accept", handleAccept);

    return () => {
      if (maskRef.current) {
        maskRef.current.destroy();
        maskRef.current = null;
      }
    };
  }, [maskOptions, onAccept]);

  return [inputRef, updateValue];
};
