import React, { useState } from "react";
import style from "./passport.module.scss";
import { ReactComponent as PassportIcon } from "../../../../assets/icons/account/passport.svg";
import InputField from "../../../../components/input_field/InputField";

const Passport = () => {
  const [passportNumber, setPassportNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [issuedBy, setIssuedBy] = useState("");

  return (
    <section className={style.passport}>
      <div className={style.passport__wrapper}>
        <h2>Паспортные данные</h2>

        <ul>
          <li>
            <div className={style.passport__item__text}>
              <InputField
                label="Серия и номер паспорта"
                placeholder="Серия и номер паспорта"
                id="passport-number"
                type="text"
                value={passportNumber}
                icon={PassportIcon}
                onChange={(e) => setPassportNumber(e.target.value)}
              />
            </div>
          </li>

          <li>
            <div className={style.passport__item__text}>
              <InputField
                label="Дата выдачи"
                placeholder="Дату выдачи паспорта"
                id="issue-date"
                type="text"
                value={issueDate}
                icon={PassportIcon}
                onChange={(e) => setIssueDate(e.target.value)}
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
                onChange={(e) => setDepartmentCode(e.target.value)}
              />
            </div>
          </li>

          <li>
            <div className={style.passport__item__text}>
              <InputField
                label="Кем выдан"
                placeholder="Укажите код подразделения паспорта"
                id="issued-by"
                type="text"
                value={issuedBy}
                icon={PassportIcon}
                onChange={(e) => setIssuedBy(e.target.value)}
              />
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Passport;
