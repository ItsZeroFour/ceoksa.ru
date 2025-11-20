import React from "react";
import style from "./main.module.scss";
import img from "../../assets/images/main/head.png";
import { Link } from "react-router-dom";

const Main = () => {
  return (
    <div className={style.main}>
      <div className="container">
        <div className={style.main__wrapper}>
          <div className={style.main__text}>
            <h1>Кредитная биржа ОКСА. Экономия на кредите до 30%</h1>
            <p>Подберём кредит в любом банке на лучших условиях</p>

            <Link to="/">Оставить заявку</Link>
          </div>

          <div className={style.main__img}>
            <img src={img} alt="main" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
