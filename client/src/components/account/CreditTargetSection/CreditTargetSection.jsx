import React from "react";
import DropdownSelector from "../../dropdown_selector/DropdownSelector";

const CreditTargetSection = ({
  selectedTarget,
  onTargetSelect,
  targetOptions,
  targetRef,
  openDropdown,
  onToggleDropdown,
  styles,
}) => {
  return (
    <div
      className={`credit__main__form__item__special__con ${styles.credit__main__form__item__special}`}
    >
      <DropdownSelector
        ref={targetRef}
        label="Цель кредита"
        selected={selectedTarget}
        options={targetOptions} // используем проп
        isOpen={openDropdown}
        onToggle={onToggleDropdown}
        onSelect={onTargetSelect}
        dropdownType="target"
        ariaLabel="Выбрать цель кредита"
      />
    </div>
  );
};

export default CreditTargetSection;
