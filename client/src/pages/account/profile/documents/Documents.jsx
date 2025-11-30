import React from "react";
import style from "./documents.module.scss";
import { ReactComponent as Passport } from "../../../../assets/icons/profile/passport.svg";
import { ReactComponent as DriverLicense } from "../../../../assets/icons/profile/driver_license.svg";
import { ReactComponent as InternationalPassport } from "../../../../assets/icons/profile/international_passport.svg";
import { ReactComponent as SNILS } from "../../../../assets/icons/profile/snils.svg";
import { ReactComponent as INN } from "../../../../assets/icons/profile/inn.svg";
import gosuslugi from "../../../../assets/gosuslugi.png";

const Documents = () => {
  return (
    <div className={style.documents}>
      <div className={style.documents__wrapper}>
        <h2>Документы</h2>

        <ul>
          <li>
            <div className={style.documents__item__main}>
              <div className={style.documents__item__icon}>
                <Passport />
              </div>

              <div className={style.documents__item__text}>
                <p>Паспорт</p>
                <p>1234 567890</p>
              </div>
            </div>

            <img src={gosuslugi} alt="Госуслуги" />
          </li>

          <li>
            <div className={style.documents__item__main}>
              <div className={style.documents__item__icon}>
                <DriverLicense />
              </div>

              <div className={style.documents__item__text}>
                <p>Водительское уд-ние</p>
                <p>1234 567890</p>
              </div>
            </div>

            <img src={gosuslugi} alt="Госуслуги" />
          </li>

          <li>
            <div className={style.documents__item__main}>
              <div className={style.documents__item__icon}>
                <InternationalPassport />
              </div>

              <div className={style.documents__item__text}>
                <p>Заграничный паспорт</p>
                <p>75 4000000</p>
              </div>
            </div>

            <img src={gosuslugi} alt="Госуслуги" />
          </li>

          <li>
            <div className={style.documents__item__main}>
              <div className={style.documents__item__icon}>
                <SNILS />
              </div>

              <div className={style.documents__item__text}>
                <p>СНИЛС</p>
                <p>169-123-123 11</p>
              </div>
            </div>

            <img src={gosuslugi} alt="Госуслуги" />
          </li>

          <li>
            <div className={style.documents__item__main}>
              <div className={style.documents__item__icon}>
                <INN />
              </div>

              <div className={style.documents__item__text}>
                <p>ИНН</p>
                <p>40 00 12432973</p>
              </div>
            </div>

            <img src={gosuslugi} alt="Госуслуги" />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Documents;
