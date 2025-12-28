import React, { useState } from "react";
import style from "./contacts.module.scss";
import { ReactComponent as Phone } from "../../../../assets/icons/account/phone.svg";
import { ReactComponent as Mail } from "../../../../assets/icons/account/mail.svg";
import { ReactComponent as Edit } from "../../../../assets/icons/account/edit.svg";
import { useValidation } from "../../../../hooks/useValidation";
import { useScreenWidth } from "../../../../hooks/useScreenWidth";
import InputField from "../../../../components/input_field/InputField";
import { usePhoneMask } from "../../../../hooks/usePhoneMask";

const Contacts = () => {
  const [emailValue, setEmailValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");

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

  const mailProps = getFieldProps("mail");
  const enhancedMailProps = {
    ...mailProps,
    onChange: (e) => {
      mailProps.onChange?.(e);
      setEmailValue(e.target.value);
    },
  };

  const { inputRef: phoneInputRef } = usePhoneMask({
    onAccept: ({ value, unmaskedValue, isValid }) => {
      setPhoneValue(value);
    },
  });

  const screenWidth = useScreenWidth();
  const placeholder =
    screenWidth < 780
      ? "Укажите эл. почту"
      : "Необходимо указать электронную почту";

  console.log(emailValue);

  return (
    <section className={style.contacts}>
      <div className={style.contacts__wrapper}>
        <h2>Контактная информация</h2>

        <ul>
          <li>
            <InputField
              icon={Phone}
              label="Номер телефона"
              placeholder="+7 (9XX) XXX-XX-XX"
              id="phone"
              type="tel"
              value={phoneValue}
              ref={phoneInputRef}
            />
          </li>

          <li>
            <InputField
              icon={Mail}
              label="Электронная почта"
              placeholder={placeholder}
              id="mail"
              type="email"
              // fieldProps={getFieldProps("mail")}
              {...enhancedMailProps}
              hasError={hasError("mail")}
              errorText={errors.mail}
            />
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Contacts;
