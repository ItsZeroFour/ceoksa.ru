import React, { useState, useRef, useEffect } from "react";
import style from "./CustomSelect.module.scss";
import { ReactComponent as Angle } from "../../assets/icons/angle.svg";

const CustomSelect = ({
  icon: IconComponent,
  label,
  placeholder,
  options,
  onChange,
  defaultValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || null);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (defaultValue) {
      setSelected(defaultValue);
    }
  }, [defaultValue?.value]);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    onChange?.(option);
  };

  return (
    <div className={style.select} ref={ref}>
      <div
        className={`${style.select__head} ${
          isOpen ? style.select__head_open : ""
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {IconComponent && (
          <div className={style.select__icon}>
            <IconComponent />
          </div>
        )}

        <div className={style.select__info}>
          <span className={style.select__label}>{label}</span>
          <span
            className={
              selected ? style.select__value : style.select__placeholder
            }
          >
            {selected ? selected.title : placeholder}
          </span>
        </div>

        <Angle
          className={`${style.select__angle} ${
            isOpen ? style.select__angle_open : ""
          }`}
        />
      </div>

      {isOpen && (
        <ul className={style.select__dropdown}>
          {options.map((option) => (
            <li
              key={option.value}
              className={`${style.select__option} ${
                selected?.value === option.value
                  ? style.select__option_active
                  : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              {option.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
