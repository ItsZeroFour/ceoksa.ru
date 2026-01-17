import React, { useState } from "react";
import style from "./passport.module.scss";
import { ReactComponent as PassportIcon } from "../../../../assets/icons/account/passport.svg";
import InputField from "../../../../components/input_field/InputField";
import { useIMask } from "../../../../hooks/useIMask";
import IMask from "imask";
import { ReactComponent as Bag } from "../../../../assets/icons/account/bag.svg";
import { ReactComponent as Town } from "../../../../assets/icons/account/town.svg";

const Passport = () => {
  const [passportNumber, setPassportNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");

  const passportMask = {
    mask: "0000 000000",
    lazy: true,
    placeholderChar: "_",
  };
  const [passportRef] = useIMask(passportMask, setPassportNumber);

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
  const [dateRef] = useIMask(dateMask, setIssueDate);

  const departmentMask = {
    mask: "000-000",
    lazy: true,
    placeholderChar: "_",
  };
  const [departmentRef] = useIMask(departmentMask, setDepartmentCode);

  const dateMask2 = {
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

  const [dateInputRef] = useIMask(dateMask2, setBirthDate);

  return (
    <section className={style.passport}>
      <div className={style.passport__wrapper}>
        <h2>Паспортные данные</h2>

        <ul>
          <li>
            <div className={style.passport__item__text}>
              <InputField
                label="Серия и номер паспорта"
                placeholder="Серия и номер"
                id="passport-number"
                type="text"
                value={passportNumber}
                icon={PassportIcon}
                inputMode="numeric"
                ref={passportRef}
              />
            </div>
          </li>

          <li>
            <div className={style.passport__item__text}>
              <InputField
                label="Дата выдачи"
                placeholder="Дата выдачи"
                id="issue-date"
                type="text"
                value={issueDate}
                icon={PassportIcon}
                inputMode="numeric"
                ref={dateRef}
              />
            </div>
          </li>

          <li>
            <div className={style.passport__item__text}>
              <InputField
                label="Код подразделения"
                placeholder="Код подразделения"
                id="department-code"
                type="text"
                value={departmentCode}
                icon={PassportIcon}
                inputMode="numeric"
                ref={departmentRef}
              />
            </div>
          </li>

          <li>
            <div className={style.passport__item__text}>
              <InputField
                label="Кем выдан"
                placeholder="Кем выдан"
                id="issued-by"
                type="text"
                value={issuedBy}
                icon={PassportIcon}
                onChange={(e) => setIssuedBy(e.target.value)}
              />
            </div>
          </li>
        </ul>

        <ul>
          <li>
            <div className={style.passport__item__text}>
              <InputField
                label="Дата рождения"
                placeholder="Дата рождения"
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
                placeholder="Место рождения"
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

export default Passport;
