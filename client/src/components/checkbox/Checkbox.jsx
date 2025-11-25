import React from "react";
import style from "./checkbox.module.scss";
import { ReactComponent as Check } from "../../assets/icons/check.svg";

const Checkbox = ({ isChecked, setIsChecked }) => {
  return (
    <label className={style.checkbox_container}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => setIsChecked(e.target.checked)}
      />
      <span className={style.checkmark}>
        {isChecked && <Check className={style.check_icon} />}
      </span>
    </label>
  );
};

export default Checkbox;
