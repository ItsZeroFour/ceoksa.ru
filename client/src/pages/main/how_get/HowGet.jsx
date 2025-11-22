import React from "react";
import style from "./howget.module.scss";
import howGetImg1 from "../../../assets/images/main/how_get-1.webp";
import howGetImg2 from "../../../assets/images/main/how_get-2.webp";
import howGetImg3 from "../../../assets/images/main/how_get-3.webp";
import { Link } from "react-router-dom";
import notification from "../../../assets/icons/notification.png";

const HowGet = () => {
  return (
    <section className={style.howget}>
      <div className="container">
        <div className={style.howget__wrapper}>
          <h2>Как получить кредит</h2>

          <ul className={style.howget__list}>
            <li className={style.howget__item}>
              <div className={style.howget__item__top}>
                <div className={style.howget__item__top__count}>1</div>
                <h3>Заполните заявку</h3>
              </div>

              <p>Полностью онлайн за 5 минут</p>

              <div className={style.howget__item__img__container}>
                <img
                  className={style.howget__item__img}
                  src={howGetImg1}
                  alt="Заполните заявку"
                />
              </div>

              <Link to="/">Оставить заявку</Link>
            </li>

            <li className={style.howget__item}>
              <div className={style.howget__item__top}>
                <div className={style.howget__item__top__count}>2</div>
                <h3>Дождитесь одобрения</h3>
              </div>

              <p>Банки пришлют свои ответы за пару минут</p>

              <div className={style.howget__item__img__container}>
                <img
                  className={style.howget__item__img}
                  src={howGetImg2}
                  alt="Заполните заявку"
                />
              </div>
            </li>

            <li className={style.howget__item}>
              <div className={style.howget__item__top}>
                <div className={style.howget__item__top__count}>3</div>
                <h3>Удобно получите деньги</h3>
              </div>

              <p>Получите деньги напрямую на дебетовую карту</p>

              <div className={style.howget__item__notification__container}>
                <div className={style.howget__item__notification}>
                  <img src={notification} alt="Уведомление" />

                  <div className={style.howget__item__notification__text}>
                    <div
                      className={style.howget__item__notification__text__top}
                    >
                      <h4>T-Bank</h4>
                      <p>34m ago</p>
                    </div>

                    <p>
                      Пополнение. Счёт RUB. 1 200 000 ₽. Выдача кредита.
                      Доступно 1 235 089,76 ₽
                    </p>
                  </div>
                </div>
              </div>

              <div className={style.howget__item__img__container}>
                <img
                  className={style.howget__item__img}
                  src={howGetImg3}
                  alt="Заполните заявку"
                />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HowGet;
