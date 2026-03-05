import React from "react";
import style from "./checkbox.module.scss";

const Checkbox = ({ isChecked, setIsChecked }) => {
  return (
    <label className={style.checkbox_container}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => setIsChecked(e.target.checked)}
      />
      <span className={style.track}>
        <span className={style.thumb} />
      </span>
    </label>
  );
};

export default Checkbox;
