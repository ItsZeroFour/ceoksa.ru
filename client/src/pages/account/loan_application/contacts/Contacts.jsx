import React, { useEffect, useRef } from "react";
import style from "./contacts.module.scss";
import { ReactComponent as Phone } from "../../../../assets/icons/account/phone.svg";
import { ReactComponent as Mail } from "../../../../assets/icons/account/mail.svg";
import { useValidation } from "../../../../hooks/useValidation";
import { useScreenWidth } from "../../../../hooks/useScreenWidth";
import InputField from "../../../../components/input_field/InputField";
import { usePhoneMask } from "../../../../hooks/usePhoneMask";
import { useDispatch, useSelector } from "react-redux";
import { useDebouncedUpdate } from "../../../../hooks/useDebouncedUpdate";
import {
  updateUser,
  clearError,
} from "../../../../redux/slices/user/updateUserSlice";

const Contacts = ({ userData }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth);
  const isInitialized = useRef(false);

  const initialValues = {
    mail: user?.user?.data?.email || "",
  };

  const { getFieldProps, hasError, errors, values } = useValidation(
    initialValues,
    {
      mail: [
        (v) =>
          v && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v)
            ? "Некорректный email"
            : "",
      ],
    }
  );

  const debouncedUpdate = useDebouncedUpdate((email) => {
    dispatch(clearError());
    dispatch(
      updateUser({
        email: email,
      })
    );
  }, 3000);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

    if (values.mail && !hasError("mail")) {
      debouncedUpdate(values.mail);
    }
  }, [values.mail, hasError, debouncedUpdate]);

  const { inputRef: phoneInputRef } = usePhoneMask({
    onAccept: ({ value, unmaskedValue, isValid }) => {},
  });

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
            <InputField
              icon={Phone}
              label="Номер телефона"
              placeholder="+7 (9XX) XXX-XX-XX"
              id="phone"
              type="tel"
              readOnly={true}
              value={userData.phone}
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
              {...getFieldProps("mail")}
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
