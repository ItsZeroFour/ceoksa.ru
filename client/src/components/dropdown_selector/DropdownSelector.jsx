import React, { forwardRef } from "react";
import { ReactComponent as Angle } from "../../assets/icons/angle.svg";
import style from "../../pages/main/credit/credit.module.scss";

const DropdownSelector = forwardRef(
  (
    {
      label,
      selected,
      options,
      isOpen,
      onToggle,
      onSelect,
      dropdownType,
      ariaLabel,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className="credit__main__form__item credit__main__form__target"
        // onClick={() => onToggle(dropdownType)}
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(dropdownType, e);
        }}
      >
        <div className="credit__main__form__item__value">
          <p>{label}</p>
          <p>{selected.title}</p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(dropdownType, e);
          }}
          aria-label={ariaLabel}
        >
          <Angle />
        </button>

        {isOpen === dropdownType && (
          <ul className="dropdown__list">
            {options.map((option) => (
              <li
                key={option.value}
                className="dropdown__item"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(option);
                }}
              >
                {option.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

export default DropdownSelector;
