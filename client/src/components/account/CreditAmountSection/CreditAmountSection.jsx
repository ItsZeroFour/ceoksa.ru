import React from "react";
import { ReactComponent as Minus } from "../../../assets/icons/minus.svg";
import { ReactComponent as Plus } from "../../../assets/icons/plus.svg";
import DropdownSelector from "../../dropdown_selector/DropdownSelector";

const CreditAmountSection = ({
  value,
  onChange,
  onFocus,
  onBlur,
  onIncrement,
  onDecrement,
  selectedTerm,
  onTermSelect,
  termOptions,
  termRef,
  openDropdown,
  onToggleDropdown,
  styles,
}) => {
  return (
    <div
      className={`credit__main__form__elem ${styles.credit__main__form__elem__con}`}
    >
      <div className={styles.credit__main__form__elem__con__first}>
        <div
          className={`credit__main__form__item ${styles.credit__main__form__item__total__con}`}
        >
          <button
            type="button"
            onClick={onDecrement}
            aria-label="Уменьшить сумму"
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
            max="10000000"
            aria-label="Сумма кредита"
          />

          <button
            type="button"
            onClick={onIncrement}
            aria-label="Увеличить сумму"
          >
            <Plus />
          </button>
        </div>

        <div className={styles.credit__main__form__item__data__con}>
          <DropdownSelector
            ref={termRef}
            label="На срок"
            selected={selectedTerm}
            options={termOptions} // используем проп
            isOpen={openDropdown}
            onToggle={onToggleDropdown}
            onSelect={onTermSelect}
            dropdownType="term"
            ariaLabel="Выбрать срок кредита"
          />
        </div>
      </div>
    </div>
  );
};

export default CreditAmountSection;
