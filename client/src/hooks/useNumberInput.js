import { useState } from "react";
import { parseNumericInput, formatCurrency, clamp } from "../utils/formatters";

export const useNumberInput = (initialValue = 0, min = 0, max = Infinity) => {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event) => {
    const inputValue = parseNumericInput(event.target.value);

    if (inputValue === "") {
      setValue(0);
      return;
    }

    const numValue = clamp(Number(inputValue), min, max);
    setValue(numValue);
  };

  const handleFocus = (event) => {
    setIsFocused(true);
    if (value === 0) {
      event.target.value = "";
    }
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    if (event.target.value === "") {
      setValue(0);
    }
  };

  const increment = (step) => {
    setValue((prev) => clamp(prev + step, min, max));
  };

  const decrement = (step) => {
    setValue((prev) => clamp(prev - step, min, max));
  };

  const getDisplayValue = () => {
    if (isFocused) {
      return value === 0 ? "" : String(value);
    }
    return value === 0 ? "" : formatCurrency(value);
  };

  return {
    value,
    setValue,
    isFocused,
    displayValue: getDisplayValue(),
    handleChange,
    handleFocus,
    handleBlur,
    increment,
    decrement,
  };
};
