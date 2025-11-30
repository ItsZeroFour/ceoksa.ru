import React from "react";
import style from "./automobiles.module.scss";
import gosuslugi from "../../../../assets/gosuslugi.png";
import { ReactComponent as Car } from "../../../../assets/icons/profile/car.svg";

const Automobiles = () => {
  return (
    <div className={style.automobiles}>
      <div className={style.automobiles__wrapper}>
        <h2>Автомобили</h2>

        <ul>
          <li>
            <div className={style.automobiles__item__main}>
              <div className={style.automobiles__item__icon}>
                <Car />
              </div>

              <div className={style.automobiles__item__text}>
                <p>Наименование машины</p>
                <p>А 234 МП 77</p>
              </div>
            </div>

            <img src={gosuslugi} alt="Госуслуги" />
          </li>

          <li>
            <div className={style.automobiles__item__main}>
              <div className={style.automobiles__item__icon}>
                <Car />
              </div>

              <div className={style.automobiles__item__text}>
                <p>Наименование машины</p>
                <p>А 234 МП 77</p>
              </div>
            </div>

            <img src={gosuslugi} alt="Госуслуги" />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Automobiles;
