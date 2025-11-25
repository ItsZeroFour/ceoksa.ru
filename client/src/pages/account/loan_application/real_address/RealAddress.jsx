import React from "react";
import style from "./realaddress.module.scss";
import { ReactComponent as Location } from "../../../../assets/icons/account/location.svg";
import { ReactComponent as Edit } from "../../../../assets/icons/account/edit.svg";

const RealAddress = () => {
  return (
    <div className={style.real_address}>
      <div className={style.real_address__wrapper}>
        <h2>Адрес фактического проживания</h2>

        <div className={style.real_address__main}>
          <div className={style.real_address__item__icon}>
            <Location />
          </div>

          <form>
            <div className={style.real_address__form__item}>
              <label htmlFor="city">Населённый пункт, улица, дом</label>
              <input
                type="text"
                id="city"
                placeholder="Необходимо указать Населённый пункт, улицу, дом"
              />
              <Edit />
            </div>

            <div className={style.real_address__form__item}>
              <label htmlFor="home">Квартира</label>
              <input
                type="text"
                id="home"
                placeholder="Необходимо указать номер"
              />
              <Edit />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RealAddress;
