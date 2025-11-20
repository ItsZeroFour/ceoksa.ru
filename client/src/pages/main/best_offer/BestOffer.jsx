import React from "react";
import style from "./bestoffer.module.scss";
import { Link } from "react-router-dom";
import tbank from "../../../assets/icons/tbank.png";

const BestOffer = () => {
  return (
    <section className={style.best_offer}>
      <div className="container">
        <div className={style.best_offer__wrapper}>
          <div className={style.best_offer__left}>
            <h2>Лучшие предложения на сегодня</h2>
            <p>
              Лучшие предложения от ведущих банков с минимальными ставками
              и прозрачными условиями
            </p>

            <Link to="/">Оставить заявку</Link>
          </div>

          <div className={style.best_offer__right}>
            <div className={style.best_offer__right__top}>
              <div className={style.best_offer__right__top__bank}>
                <img src={tbank} alt="Т-банк" />

                <div className={style.best_offer__right__top__title}>
                  <p>На любые цели</p>
                  <h3>Т-Банк</h3>
                </div>
              </div>

              <div className={style.best_offer__right__top__die}>
                <p>Новое предложение</p>
              </div>
            </div>

            <div className={style.best_offer__right__main}>
              <div className={style.best_offer__right__main__credit_item}>
                <p>Полная стоимость кредита</p>
                <p>22,9-24,95%</p>
              </div>

              <div className={style.best_offer__right__main__other}>
                <div className={style.best_offer__right__main__credit_item}>
                  <p>Платёж в месяц</p>
                  <p>от 373 ₽</p>
                </div>

                <div className={style.best_offer__right__main__credit_item}>
                  <p>Сумма кредита</p>
                  <p>до 2 млн ₽</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestOffer;
