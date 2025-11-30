import React from "react";
import style from "./rekvisits.module.scss";
import { ReactComponent as Card } from "../../../../assets/icons/profile/card.svg";
import { ReactComponent as Edit } from "../../../../assets/icons/account/edit.svg";

const Rekvisits = () => {
  return (
    <div className={style.rekvisits}>
      <div className={style.rekvisits__wrapper}>
        <h2>Реквизиты для перевода</h2>

        <ul>
          <li>
            <div className={style.rekvisits__item__main}>
              <div className={style.rekvisits__item__icon}>
                <Card />
              </div>

              <div className={style.rekvisits__form__item}>
                <label htmlFor="address">Банк ВТБ (ПАО)</label>
                <input
                  type="text"
                  id="address"
                  placeholder="Необходимо указать реквизиты для перевода"
                />
                <Edit />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Rekvisits;
