import { useRef, useEffect, useState } from "react";
import IMask from "imask";

export const usePhoneMask = ({
  mask = "+{7} (000) 000-00-00",
  lazy = true,
  onAccept,
  initialValue = "",
} = {}) => {
  const inputRef = useRef(null);
  const maskRef = useRef(null);
  const onAcceptRef = useRef(onAccept);
  const [phone, setPhone] = useState("");
  const [unmaskedPhone, setUnmaskedPhone] = useState("");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    onAcceptRef.current = onAccept;
  }, [onAccept]);

  useEffect(() => {
    if (!inputRef.current) return;

    maskRef.current = IMask(inputRef.current, { mask, lazy });

    const handleChange = () => {
      const value = maskRef.current.value;
      const unmasked = maskRef.current.unmaskedValue;
      const valid = unmasked.length === 11;

      setPhone(value);
      setUnmaskedPhone(unmasked);
      setIsValid(valid);

      if (onAcceptRef.current) {
        onAcceptRef.current({ value, unmaskedValue: unmasked, isValid: valid });
      }
    };

    // Сначала подписываемся
    maskRef.current.on("accept", handleChange);

    // Потом устанавливаем значение — это триггернет accept
    if (initialValue) {
      maskRef.current.value = initialValue;
      maskRef.current.updateValue();
    }

    return () => {
      if (maskRef.current) {
        maskRef.current.destroy();
        maskRef.current = null;
      }
    };
  }, [mask, lazy]);

  return { inputRef, phone, unmaskedPhone, isValid };
};
