import { useState } from "react";
import { useNumberFormatter } from "./useNumberFormatter";

export const useSalaryValidation = () => {
  const [salaryRaw, setSalaryRaw] = useState("");
  const [salaryError, setSalaryError] = useState("");
  const [isSalaryFocused, setIsSalaryFocused] = useState(false);
  const { formatNumber } = useNumberFormatter();

  const handleSalaryChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setSalaryRaw(digitsOnly);
    if (salaryError) setSalaryError("");
  };

  const handleSalaryFocus = () => {
    setIsSalaryFocused(true);
    setSalaryError("");
  };

  const handleSalaryBlur = () => {
    setIsSalaryFocused(false);
    if (!salaryRaw) {
      setSalaryError("Укажите размер заработной платы");
    }
  };

  const displaySalary = isSalaryFocused
    ? formatNumber(salaryRaw)
    : salaryRaw
    ? `${formatNumber(salaryRaw)} ₽`
    : "";

  return {
    salaryRaw,
    salaryError,
    isSalaryFocused,
    handleSalaryChange,
    handleSalaryFocus,
    handleSalaryBlur,
    displaySalary,
  };
};