import React from "react";
import { ReactComponent as Minus } from "../../../assets/icons/minus.svg";
import { ReactComponent as Plus } from "../../../assets/icons/plus.svg";
import { CREDIT_LIMITS } from "../../../constants/creditConstants";

const CreditAmountInput = ({
  value,
  onChange,
  onFocus,
  onBlur,
  onIncrement,
  onDecrement,
}) => {
  return (
    <div className="credit__main__form__item">
      <button
        type="button"
        onClick={onDecrement}
        aria-label="Уменьшить сумму кредита"
      >
        <Minus />
      </button>

      <input
        className="credit__main__form__item__total"
        inputMode="numeric"
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        max={CREDIT_LIMITS.MAX_AMOUNT}
        aria-label="Сумма кредита"
      />

      <button
        type="button"
        onClick={onIncrement}
        aria-label="Увеличить сумму кредита"
      >
        <Plus />
      </button>
    </div>
  );
};

export default CreditAmountInput;
