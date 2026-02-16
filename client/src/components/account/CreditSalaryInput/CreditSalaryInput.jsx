import React from "react";

const CreditSalaryInput = ({
  value,
  error,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  styles,
}) => {
  return (
    <div className="credit__main__form__other">
      <div
        className={`credit__main__form__cash ${
          error ? "error" : ""
        } ${styles.credit__main__form__cash__special}`}
      >
        <div
          className={`credit__main__form__item__value ${styles.credit__main__form__item__value__special}`}
        >
          <p>Размер заработной платы</p>
          <div
            className={`credit__main__form__item__input__container ${styles.credit__main__form__item__input__container__speacial}`}
          >
            <input
              type="text"
              inputMode="numeric"
              placeholder="Например, 100 000 ₽"
              value={value}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              className={`${styles.salaryInput} ${
                error ? styles.inputError : ""
              }`}
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
    </div>
  );
};

export default CreditSalaryInput;
