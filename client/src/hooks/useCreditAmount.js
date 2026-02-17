import { useState, useCallback, useMemo } from "react";
import { useNumberFormatter } from "./useNumberFormatter";

export const useCreditAmount = (options = {}) => {
  const {
    initialValue = 500000,
    minAmount = 0,
    maxAmount = 10000000,
    step = 1000,
  } = options;

  const [amountState, setAmountState] = useState({
    raw: String(initialValue),
    isFocused: false,
  });

  const { formatNumber } = useNumberFormatter();

  const handleAmountChange = useCallback(
    (e) => {
      const value = e.target.value;
      const cleanValue = value.replace(/\D/g, "");

      if (cleanValue === "") {
        setAmountState((prev) => ({ ...prev, raw: "0" }));
        return;
      }

      const numValue = Number(cleanValue);
      const clampedValue = Math.min(maxAmount, Math.max(minAmount, numValue));

      setAmountState((prev) => ({ ...prev, raw: String(clampedValue) }));
    },
    [minAmount, maxAmount],
  );

  const handleAmountFocus = useCallback((e) => {
    setAmountState((prev) => {
      if (prev.raw === "0") {
        e.target.value = "";
      }
      return { ...prev, isFocused: true };
    });
  }, []);

  const handleAmountBlur = useCallback((e) => {
    setAmountState((prev) => {
      const newRaw = e.target.value === "" ? "0" : prev.raw;
      return { ...prev, isFocused: false, raw: newRaw };
    });
  }, []);

  const increment = useCallback(() => {
    setAmountState((prev) => {
      const currentValue = Number(prev.raw);
      const newValue = Math.min(maxAmount, currentValue + step);
      return { ...prev, raw: String(newValue) };
    });
  }, [maxAmount, step]);

  const decrement = useCallback(() => {
    setAmountState((prev) => {
      const currentValue = Number(prev.raw);
      const newValue = Math.max(minAmount, currentValue - step);
      return { ...prev, raw: String(newValue) };
    });
  }, [minAmount, step]);

  const displayAmount = useMemo(() => {
    const numValue = Number(amountState.raw);

    if (numValue === 0 && !amountState.isFocused) {
      return "";
    }

    if (amountState.isFocused) {
      return numValue === 0 ? "" : amountState.raw;
    }

    return `${formatNumber(amountState.raw)} ₽`;
  }, [amountState.raw, amountState.isFocused, formatNumber]);

  const getAmountValue = useCallback(() => {
    return Number(amountState.raw);
  }, [amountState.raw]);

  const setAmountValue = useCallback((value) => {
    const stringValue = String(value);
    setAmountState((prev) => ({ ...prev, raw: stringValue }));
  }, []);

  return useMemo(
    () => ({
      amountRaw: amountState.raw,
      amountValue: getAmountValue(),
      isAmountFocused: amountState.isFocused,
      displayAmount,
      handleAmountChange,
      handleAmountFocus,
      handleAmountBlur,
      increment,
      decrement,
      setAmountValue,
    }),
    [
      amountState.raw,
      amountState.isFocused,
      displayAmount,
      handleAmountChange,
      handleAmountFocus,
      handleAmountBlur,
      increment,
      decrement,
      getAmountValue,
      setAmountValue,
    ],
  );
};
