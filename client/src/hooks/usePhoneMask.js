// src/hooks/usePhoneMask.js
import { useRef, useEffect, useState } from "react";
import IMask from "imask";

/**
 * Хук для привязки маски телефона к input-элементу
 * @param {Object} options
 * @param {string} [options.mask="+{7} (000) 000-00-00"] - маска по умолчанию для РФ
 * @param {boolean} [options.lazy=true]
 * @param {function} [options.onAccept] - колбэк при изменении значения
 * @returns {{inputRef: React.RefObject, phone: string, unmaskedPhone: string, isValid: boolean}}
 */
export const usePhoneMask = ({
  mask = "+{7} (000) 000-00-00",
  lazy = true,
  onAccept,
} = {}) => {
  const inputRef = useRef(null);
  const maskRef = useRef(null);
  const [phone, setPhone] = useState("");
  const [unmaskedPhone, setUnmaskedPhone] = useState("");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!inputRef.current) return;

    const maskOptions = { mask, lazy };
    maskRef.current = IMask(inputRef.current, maskOptions);

    const handleChange = () => {
      const value = maskRef.current.value;
      const unmasked = maskRef.current.unmaskedValue;
      const valid = unmasked.length === 11;

      setPhone(value);
      setUnmaskedPhone(unmasked);
      setIsValid(valid);

      if (onAccept) {
        onAccept({ value, unmaskedValue: unmasked, isValid: valid });
      }
    };

    maskRef.current.on("accept", handleChange);
    handleChange();

    return () => {
      if (maskRef.current) {
        maskRef.current.destroy();
        maskRef.current = null;
      }
    };
  }, [mask, lazy, onAccept]);

  return {
    inputRef,
    phone,
    unmaskedPhone,
    isValid,
  };
};
