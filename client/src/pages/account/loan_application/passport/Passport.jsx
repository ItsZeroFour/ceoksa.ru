import React from "react";
import style from "./passport.module.scss";
import { ReactComponent as Bag } from "../../../../assets/icons/account/bag.svg";
import { ReactComponent as Town } from "../../../../assets/icons/account/town.svg";
import { ReactComponent as PassportIcon } from "../../../../assets/icons/account/passport.svg";

const Passport = () => {
  return (
    <section className={style.passport}>
      <div className={style.passport__wrapper}>
        <h2>Паспортные данные</h2>

        <ul>
          <li>
            <div className={style.passport__item__icon}>
              <Bag />
            </div>

            <div className={style.passport__item__text}>
              <p>Дата рождения</p>
              <p>17 октября 1998</p>
            </div>
          </li>

          <li>
            <div className={style.passport__item__icon}>
              <Town />
            </div>

            <div className={style.passport__item__text}>
              <p>Место рождения</p>
              <p>город Москва</p>
            </div>
          </li>

          <li>
            <div className={style.passport__item__icon}>
              <PassportIcon />
            </div>

            <div className={style.passport__item__text__container}>
              <div className={style.passport__item__text}>
                <p>Серия и номер паспорта</p>
                <p>4515 123456</p>
              </div>

              <div className={style.passport__item__text}>
                <p>Дата выдачи</p>
                <p>14.08.2020</p>
              </div>

              <div className={style.passport__item__text}>
                <p>Код подразделения</p>
                <p>770–010</p>
              </div>

              <div className={style.passport__item__text}>
                <p>Кем выдан</p>
                <p>ГУ МВД России по Москве и Московской области</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Passport;
