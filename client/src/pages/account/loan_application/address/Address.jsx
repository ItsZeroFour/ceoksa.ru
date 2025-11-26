import React from "react";
import style from "./address.module.scss";
import { ReactComponent as Location } from "../../../../assets/icons/account/location.svg";
import Checkbox from "../../../../components/checkbox/Checkbox";

const Address = ({ setIsChecked, isChecked }) => {
  return (
    <section className={style.address}>
      <div className={style.address__wrapper}>
        <h2>Адрес регистрации</h2>

        <div className={style.address__container}>
          <div className={style.address__item__icon}>
            <Location />
          </div>

          <div className={style.address__item__text__container}>
            <div className={style.address__item__text}>
              <p>Населённый пункт, улица, дом</p>
              <p>г.. Москва, ул.. 3-я Фрунзенская, д.. 5</p>
            </div>

            <div className={style.address__item__text}>
              <p>Квартира</p>
              <p>32</p>
            </div>

            <div className={style.address__item__text}>
              <p>Дата регистрации</p>
              <p>18 октября 1998</p>
            </div>
          </div>
        </div>

        <div
          className={style.address__check}
          onClick={() => setIsChecked(!isChecked)}
        >
          <Checkbox setIsChecked={setIsChecked} isChecked={isChecked} />
          <p>Адрес фактического проживания совпадает с адресом регистрации</p>
        </div>
      </div>
    </section>
  );
};

export default Address;
