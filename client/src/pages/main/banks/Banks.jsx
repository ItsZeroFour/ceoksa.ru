import React from "react";
import style from "./banks.module.scss";
import sber from "../../../assets/images/main/banks/sber.png";
import vtb from "../../../assets/images/main/banks/vtb.png";
import tbank from "../../../assets/images/main/banks/tbank.png";
import alfa from "../../../assets/images/main/banks/alfa.png";
import mkb from "../../../assets/images/main/banks/mkb.png";
import sovkom from "../../../assets/images/main/banks/sovkom.png";

const Banks = () => {
  return (
    <section className={style.banks}>
      <div className="container">
        <div className={style.banks__wrapper}>
          <h2>Банки-партнёры</h2>

          <ul>
            <li>
              <img src={sber} alt="Сбер банк" />
            </li>

            <li>
              <img src={vtb} alt="ВТБ" />
            </li>

            <li>
              <img src={tbank} alt="Т-банк" />
            </li>

            <li>
              <img src={alfa} alt="Алфа-банк" />
            </li>

            <li>
              <img src={mkb} alt="МКБ" />
            </li>

            <li>
              <img src={sovkom} alt="Совкомбанк" />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Banks;
