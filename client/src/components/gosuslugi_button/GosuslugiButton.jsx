import React from "react";
import style from "./gosuslugibutton.module.scss";
import gosuslugi from "../../assets/gosuslugi.png";

const GosuslugiButton = () => {
  return (
    <button className={style.button} disabled>
      <img src={gosuslugi} alt="gosuslugi" /> Войти через Госуслуги
    </button>
  );
};

export default GosuslugiButton;
