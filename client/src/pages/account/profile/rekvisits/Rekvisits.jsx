import React from "react";
import style from "./rekvisits.module.scss";
import { ReactComponent as Card } from "../../../../assets/icons/profile/card.svg";
import { ReactComponent as Edit } from "../../../../assets/icons/account/edit.svg";
import { useScreenWidth } from "../../../../hooks/useScreenWidth";

const Rekvisits = ({ user }) => {
  const screenWidth = useScreenWidth();

  const placeholder =
    screenWidth < 780
      ? "Укажите реквизиты"
      : "Необходимо указать реквизиты для перевода";

  const handleNumbersOnly = (e) => {
    const target = e.target;
    target.value = target.value.replace(/\D/g, "");
  };

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
                <label htmlFor="bik">Банк ВТБ (ПАО)</label>
                <input
                  type="nymber"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="bik"
                  onInput={handleNumbersOnly}
                  placeholder={placeholder}
                  readOnly={true}
                  value={user.requisites.account_number}
                />
                {/* <Edit /> */}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Rekvisits;
