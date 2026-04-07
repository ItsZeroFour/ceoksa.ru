import { useRef, useEffect, useState } from "react";
import IMask from "imask";

export const usePhoneMask = ({
  mask = "(000) 000-00-00",
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
      const rawValue = maskRef.current.value;
      const unmasked = maskRef.current.unmaskedValue;
      const valid = unmasked.length === 10;
      const fullValue = "+7 " + rawValue;
      const fullUnmasked = "7" + unmasked;

      setPhone(fullValue);
      setUnmaskedPhone(fullUnmasked);
      setIsValid(valid);

      if (onAcceptRef.current) {
        onAcceptRef.current({ value: fullValue, unmaskedValue: fullUnmasked, isValid: valid });
      }
    };

    // Сначала подписываемся
    maskRef.current.on("accept", handleChange);

    // Потом устанавливаем значение — это триггернет accept
    if (initialValue) {
      // Убираем +7 из начала если есть, т.к. маска теперь без +7
      let cleanValue = initialValue;
      if (cleanValue.startsWith("+7 ")) cleanValue = cleanValue.slice(3);
      else if (cleanValue.startsWith("+7")) cleanValue = cleanValue.slice(2);
      maskRef.current.value = cleanValue;
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
