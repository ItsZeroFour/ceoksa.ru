import React, { useRef, useState } from "react";
import style from "./birth.module.scss";
import { ReactComponent as Bag } from "../../../../assets/icons/account/bag.svg";
import { ReactComponent as Town } from "../../../../assets/icons/account/town.svg";
import InputField from "../../../../components/input_field/InputField";
import { useIMask } from "../../../../hooks/useIMask";
import IMask from "imask";

const Birth = () => {
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");

  const dateMask = {
    mask: Date,
    pattern: "d{.}`m{.}`Y",
    blocks: {
      d: { mask: IMask.MaskedRange, from: 1, to: 31, maxLength: 2 },
      m: { mask: IMask.MaskedRange, from: 1, to: 12, maxLength: 2 },
      Y: { mask: IMask.MaskedRange, from: 1900, to: 2099, maxLength: 4 },
    },
    autofix: true,
    lazy: true,
  };

  const [dateInputRef] = useIMask(dateMask, setBirthDate);

  return (
    <section className={style.birth}>
      <div className={style.birth__wrapper}>
        <h2>Дата и место рождения</h2>

        <ul>
          <li>
            <div className={style.passport__item__text}>
              <InputField
                label="Дата рождения"
                placeholder="Например: 17.10.1998"
                id="birth-date"
                type="text"
                value={birthDate}
                inputMode="numeric"
                icon={Bag}
                ref={dateInputRef}
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
