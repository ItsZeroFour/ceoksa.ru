import React from "react";
import style from "./contacts.module.scss";
import { ReactComponent as Phone } from "../../../../assets/icons/account/phone.svg";
import { ReactComponent as Mail } from "../../../../assets/icons/account/mail.svg";
import { ReactComponent as Edit } from "../../../../assets/icons/account/edit.svg";
import { useValidation } from "../../../../hooks/useValidation";
import { useScreenWidth } from "../../../../hooks/useScreenWidth";

const Contacts = () => {
  const { getFieldProps, hasError, errors } = useValidation(
    { mail: "" },
    {
      mail: [
        (v) =>
          v && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v)
            ? "Некорректный email"
            : "",
      ],
    }
  );

  const screenWidth = useScreenWidth();
  const placeholder =
    screenWidth < 780
      ? "Укажите эл. почту"
      : "Необходимо указать электронную почту";

  return (
    <section className={style.contacts}>
      <div className={style.contacts__wrapper}>
        <h2>Контактная информация</h2>

        <ul>
          <li>
            <div className={style.contacts__item__icon}>
              <Phone />
            </div>

            <div className={style.contacts__item__text}>
              <p>Номер телефона</p>
              <p>+7 987 654-32-10</p>
            </div>
          </li>

          <li>
            <div className={style.contacts__item__icon}>
              <Mail />
            </div>

            <div
              className={
                hasError("mail")
                  ? `${style.contacts__form__item} ${style.error}`
                  : style.contacts__form__item
              }
            >
              <label htmlFor="mail">Электронная почта</label>
              <input
                type="email"
                id="mail"
                placeholder={placeholder}
                {...getFieldProps("mail")}
              />
              <Edit />
              {hasError("mail") && (
                <span className={style.error_text}>{errors.mail}</span>
              )}
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Contacts;
