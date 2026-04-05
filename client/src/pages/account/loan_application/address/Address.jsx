import React, { useState, useEffect, useRef } from "react";
import style from "./address.module.scss";
import { ReactComponent as Location } from "../../../../assets/icons/account/location.svg";
import { ReactComponent as Passport } from "../../../../assets/icons/account/passport.svg";
import Checkbox from "../../../../components/checkbox/Checkbox";
import InputField from "../../../../components/input_field/InputField";
import { useIMask } from "../../../../hooks/useIMask";
import IMask from "imask";
import { useDispatch, useSelector } from "react-redux";
import { useDebouncedUpdate } from "../../../../hooks/useDebouncedUpdate";
import {
  updateUser,
  clearError,
} from "../../../../redux/slices/user/updateUserSlice";

const Address = ({ setIsChecked, isChecked }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth);
  const initialized = useRef(false);

  const formDataRef = useRef({
    street: "",
    apartment: "",
    registration_date: "",
  });

  const [formData, setFormData] = useState(formDataRef.current);
  const [errors, setErrors] = useState({});

  const registrationDateMask = {
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

  const [registrationDateRef] = useIMask(registrationDateMask, (value) => {
    handleFieldChange("registration_date", value);
  });

  const debouncedUpdate = useDebouncedUpdate((data) => {
    dispatch(clearError());
    dispatch(updateUser({ address: data }));
  }, 3000);

  useEffect(() => {
    if (!initialized.current && user.status === "succeeded" && user.user.data) {
      if (user.user.data.address) {
        const data = {
          street: user.user.data.address.street || "",
          apartment: user.user.data.address.apartment || "",
          registration_date: user.user.data.address.registration_date || "",
        };
        formDataRef.current = data;
        setFormData(data);
      }
      if (user.user.data.address_doesnt_match !== undefined) {
        setIsChecked(!user.user.data.address_doesnt_match);
      }
      initialized.current = true;
    }
  }, [user, setIsChecked]);

  const validate = (fieldName, value) => {
    if (fieldName === "street") {
      if (!value) return "Поле обязательно";
      if (value.length < 10) return "Минимум 10 символов";
    }
    if (fieldName === "registration_date") {
      if (!value) return "Поле обязательно";
      if (value.length < 10) return "Введите полную дату";
      const [day, month, year] = value.split(".");
      const date = new Date(`${year}-${month}-${day}`);
      if (isNaN(date.getTime())) return "Некорректная дата";
    }
    return "";
  };

  const handleFieldChange = (fieldName, value) => {
    const newFormData = { ...formDataRef.current, [fieldName]: value };
    formDataRef.current = newFormData;
    setFormData(newFormData);

    const err = validate(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: err }));

    if (!err) {
      const hasOtherErrors = Object.entries(errors).some(
        ([key, val]) => key !== fieldName && val
      );
      if (!hasOtherErrors) {
        debouncedUpdate(newFormData);
      }
    }
  };

  const handleChange = (e) => {
    handleFieldChange(e.target.name, e.target.value);
  };

  const handleCheckboxChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    dispatch(clearError());
    dispatch(updateUser({ address_doesnt_match: !newCheckedState }));
  };

  return (
    <section className={style.address}>
      <div className={style.address__wrapper}>
        <h2>Адрес регистрации</h2>

        <div className={style.address__container}>
          <div className={style.address__item__text__container}>
            <div className={style.address__item__text__wrapper}>
              <div
                className={`${style.address__item__text} ${
                  errors.street ? style.error : ""
                }`}
              >
                <InputField
                  label="Населённый пункт, улица, дом"
                  placeholder="Нас. пункт, улица, дом, кв."
                  id="street-address"
                  type="text"
                  name="street"
                  value={formData.street}
                  icon={Location}
                  onChange={handleChange}
                  readOnly={true}
                />
              </div>
              {errors.street && (
                <span className={style.error_text}>{errors.street}</span>
              )}
            </div>

            <div className={style.address__item__text__wrapper}>
              <div
                className={`${style.address__item__text} ${
                  errors.registration_date ? style.error : ""
                }`}
              >
                <InputField
                  label="Дата регистрации"
                  placeholder="Дата регистрации"
                  id="registration-date"
                  type="text"
                  value={formData.registration_date}
                  icon={Passport}
                  inputMode="numeric"
                  ref={registrationDateRef}
                />
              </div>
              {errors.registration_date && (
                <span className={style.error_text}>
                  {errors.registration_date}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={style.address__check} onClick={handleCheckboxChange}>
          <Checkbox setIsChecked={setIsChecked} isChecked={isChecked} />
          <p>Адрес фактического проживания совпадает с адресом регистрации</p>
        </div>
      </div>
    </section>
  );
};

export default Address;
