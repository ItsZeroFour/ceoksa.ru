import { useState, useCallback, useMemo, useRef } from "react";
import { useNumberFormatter } from "./useNumberFormatter";

export const useSalaryValidation = (options = {}) => {
  const {
    initialValue = "",
    minSalary = 10000,
    maxSalary = 10000000,
    debounceDelay = 300,
  } = options;

  const initialRaw =
    initialValue === null || initialValue === undefined || initialValue === ""
      ? ""
      : String(initialValue).replace(/\D/g, "");

  const [salaryState, setSalaryState] = useState({
    raw: initialRaw,
    error: "",
    isFocused: false,
    lastValidValue: initialRaw,
  });

  const { formatNumber, parseNumber } = useNumberFormatter();
  const debounceRef = useRef(null);

  const handleSalaryChange = useCallback(
    (e) => {
      const value = e.target.value;

      if (value === salaryState.raw) return;

      const cleanValue = value.replace(/\D/g, "").slice(0, 8);

      if (salaryState.error) {
        setSalaryState((prev) => ({ ...prev, error: "" }));
      }

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        validateSalary(cleanValue);
      }, debounceDelay);

      setSalaryState((prev) => ({ ...prev, raw: cleanValue }));
    },
    [salaryState.error, salaryState.raw, debounceDelay]
  );

  const validateSalary = useCallback(
    (value) => {
      const numValue = Number(value);

      if (!value) {
        return "Укажите размер заработной платы";
      }

      if (numValue < minSalary) {
        return `Минимальная зарплата ${formatNumber(minSalary)} ₽`;
      }

      if (numValue > maxSalary) {
        return `Максимальная зарплата ${formatNumber(maxSalary)} ₽`;
      }

      return "";
    },
    [minSalary, maxSalary, formatNumber]
  );

  const handleSalaryFocus = useCallback(() => {
    setSalaryState((prev) => ({
      ...prev,
      isFocused: true,
      error: "",
    }));
  }, []);

  const handleSalaryBlur = useCallback(() => {
    setSalaryState((prev) => {
      const error = validateSalary(prev.raw);
      return {
        ...prev,
        isFocused: false,
        error,
        lastValidValue: error ? prev.lastValidValue : prev.raw,
      };
    });
  }, [validateSalary]);

  const displaySalary = useMemo(() => {
    if (!salaryState.raw) return "";

    const formatted = formatNumber(salaryState.raw);

    return salaryState.isFocused ? formatted : `${formatted} ₽`;
  }, [salaryState.raw, salaryState.isFocused, formatNumber]);

  const getSalaryValue = useCallback(() => {
    return salaryState.raw ? Number(salaryState.raw) : null;
  }, [salaryState.raw]);

  const setSalaryValue = useCallback(
    (value) => {
      if (value === null || value === undefined) {
        setSalaryState({
          raw: "",
          error: "",
          isFocused: false,
          lastValidValue: "",
        });
        return;
      }

      const stringValue = String(value).replace(/\D/g, "");
      const error = validateSalary(stringValue);

      setSalaryState({
        raw: stringValue,
        error,
        isFocused: false,
        lastValidValue: error ? salaryState.lastValidValue : stringValue,
      });
    },
    [salaryState.lastValidValue, validateSalary]
  );

  const handleKeyDown = useCallback((e) => {
    if (
      [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
        "Enter",
      ].includes(e.key)
    ) {
      return;
    }

    if (!/^\d$/.test(e.key) && e.key !== " ") {
      e.preventDefault();
    }
  }, []);

  return useMemo(
    () => ({
      salaryRaw: salaryState.raw,
      salaryValue: getSalaryValue(),
      salaryError: salaryState.error,
      isSalaryFocused: salaryState.isFocused,
      displaySalary,
      handleSalaryChange,
      handleSalaryFocus,
      handleSalaryBlur,
      handleKeyDown,
      setSalaryValue,
    }),
    [
      salaryState.raw,
      salaryState.error,
      salaryState.isFocused,
      displaySalary,
      handleSalaryChange,
      handleSalaryFocus,
      handleSalaryBlur,
      handleKeyDown,
      getSalaryValue,
      setSalaryValue,
    ]
  );
};
