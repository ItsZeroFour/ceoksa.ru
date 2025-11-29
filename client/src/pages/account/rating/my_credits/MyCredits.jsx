import React from "react";
import style from "./mycredits.module.scss";
import { ReactComponent as Wallet } from "../../../../assets/icons/account/rating/wallet.svg";
import { ReactComponent as Card } from "../../../../assets/icons/account/rating/card.svg";

const MyCredits = () => {
  return (
    <div className={style.my_credits}>
      <div className={style.my_credits__wrapper}>
        <h3>Ваши кредиты</h3>

        <ul>
          <li>
            <div className={style.my_credits__item__icon}>
              <Wallet />
            </div>

            <div className={style.my_credits__item__info}>
              <p>Кредит 1 800 000 ₽</p>
              <p>14 678,91 ₽ от 26.07.2023</p>
            </div>
          </li>

          <li>
            <div className={style.my_credits__item__icon}>
              <Card />
            </div>

            <div className={style.my_credits__item__info}>
              <p>Кредитная карта 800 000 ₽</p>
              <p>0 ₽ от 26.07.2023</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MyCredits;
