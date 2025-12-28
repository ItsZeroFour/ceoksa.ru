import React, { useState } from "react";
import style from "./birth.module.scss";
import { ReactComponent as Bag } from "../../../../assets/icons/account/bag.svg";
import { ReactComponent as Town } from "../../../../assets/icons/account/town.svg";
import InputField from "../../../../components/input_field/InputField";

const Birth = () => {
  const [birthDate, setBirthDate] = useState("17 октября 1998");
  const [birthPlace, setBirthPlace] = useState("город Москва");

  return (
    <section className={style.birth}>
      <div className={style.birth__wrapper}>
        <h2>Дата и место рождения</h2>

        <ul>
          <li>
            <div className={style.passport__item__text}>
              <InputField
                label="Дата рождения"
                placeholder="Например: 17 октября 1998"
                id="birth-date"
                type="text"
                value={birthDate}
                icon={Bag}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
          </li>

          <li>
            <div className={style.passport__item__text}>
              <InputField
                label="Место рождения"
                placeholder="Например: город Москва"
                id="birth-place"
                type="text"
                value={birthPlace}
                icon={Town}
                onChange={(e) => setBirthPlace(e.target.value)}
              />
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Birth;
