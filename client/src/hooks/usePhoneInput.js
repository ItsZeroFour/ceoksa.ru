import { useEffect, useRef, useState } from "react";
import IMask from "imask";

export const usePhoneInput = () => {
  const phoneInputRef = useRef(null);
  const [phone, setPhone] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!phoneInputRef.current) return;

    const maskOptions = {
      mask: "+{7} (000) 000-00-00",
      lazy: true,
    };

    const mask = IMask(phoneInputRef.current, maskOptions);

    const handleChange = () => {
      const isValid = mask.unmaskedValue.length === 11;
      setIsComplete(isValid);
      setPhone(mask._value);
    };

    mask.on("accept", handleChange);
    handleChange();

    return () => {
      mask.destroy();
    };
  }, []);

  const getCleanPhone = () => {
    return phone.replace(/\D/g, "");
  };

  const reset = () => {
    setPhone("");
    setIsComplete(false);
    if (phoneInputRef.current) {
      phoneInputRef.current.value = "";
    }
  };

  return {
    phoneInputRef,
    phone,
    isComplete,
    getCleanPhone,
    reset,
  };
};
