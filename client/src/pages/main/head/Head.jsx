import React from "react";
import style from "./head.module.scss";
import img from "../../../assets/images/main/head.png";
import { Link } from "react-router-dom";

const Head = () => {
  return (
    <div className={style.head}>
      <div className="container">
        <div className={style.head__wrapper}>
          <div className={style.head__text}>
            <h1>Кредитная биржа ОКСА. Экономия на кредите до 30%</h1>
            <p>Подберём кредит в любом банке на лучших условиях</p>

            <Link to="/">Оставить заявку</Link>
          </div>

          <div className={style.head__img}>
            <img src={img} alt="main" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Head;
