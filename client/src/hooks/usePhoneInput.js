import { useCallback, useRef, useState } from "react";
import IMask from "imask";

export const usePhoneInput = () => {
  const maskRef = useRef(null);
  const [phone, setPhone] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const phoneInputRef = useCallback((node) => {
    if (!node) {
      maskRef.current?.destroy();
      maskRef.current = null;
      return;
    }

    const mask = IMask(node, {
      mask: "(000) 000-00-00",
      lazy: true,
    });

    const handleChange = () => {
      const isValid = mask.unmaskedValue.length === 10;
      setIsComplete(isValid);
      setPhone("+7 " + mask._value);
    };

    mask.on("accept", handleChange);
    handleChange();

    maskRef.current = mask;
  }, []);

  const getCleanPhone = () => ("7" + (maskRef.current?.unmaskedValue || ""));

  const reset = useCallback(() => {
    setPhone("");
    setIsComplete(false);
    if (maskRef.current) {
      maskRef.current.value = "";
      maskRef.current.updateValue();
    }
  }, []);

  return { phoneInputRef, phone, isComplete, getCleanPhone, reset };
};
