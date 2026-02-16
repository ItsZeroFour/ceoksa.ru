import React from "react";

const SalaryInput = ({
  value,
  error,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
}) => {
  return (
    <div className={`credit__main__form__cash ${error ? "error" : ""}`}>
      <div className="credit__main__form__item__value">
        <p>Размер заработной платы</p>
        <div className="credit__main__form__item__input__container">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Например, 100 000 ₽"
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            aria-invalid={!!error}
            aria-describedby={error ? "salary-error" : undefined}
          />
        </div>

        {error && (
          <p id="salary-error" className="credit__main__form__cash__error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default SalaryInput;
