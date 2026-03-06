import React, { useEffect, useRef, useState } from "react";
import style from "./additional_telephone.module.scss";
import { ReactComponent as Phone } from "../../../../assets/icons/account/phone.svg";
import { ReactComponent as Mail } from "../../../../assets/icons/account/mail.svg";
import { ReactComponent as Person } from "../../../../assets/icons/person.svg";
import { useScreenWidth } from "../../../../hooks/useScreenWidth";
import InputField from "../../../../components/input_field/InputField";
import { usePhoneMask } from "../../../../hooks/usePhoneMask";
import { useDispatch, useSelector } from "react-redux";
import { useDebouncedUpdate } from "../../../../hooks/useDebouncedUpdate";
import {
  updateUser,
  clearError,
} from "../../../../redux/slices/user/updateUserSlice";
import CustomSelect from "../../../../components/CustomSelect/CustomSelect";

const AdditionalTelephone = ({ userData }) => {
  const dispatch = useDispatch();
  const additionalTelephone = useSelector(
    (state) => state.auth.user?.data?.additional_telephone
  );

  console.log(userData.phone);

  const formDataRef = useRef({
    phone: "",
    name: "",
    owner: "",
  });

  const [formData, setFormData] = useState(formDataRef.current);
  const [errors, setErrors] = useState({});

  const onAcceptRef = useRef(null);

  const debouncedUpdate = useDebouncedUpdate((data) => {
    dispatch(clearError());
    dispatch(updateUser({ additional_telephone: data }));
  }, 3000);

  useEffect(() => {
    if (additionalTelephone) {
      const data = {
        phone: additionalTelephone.phone || "",
        name: additionalTelephone.name || "",
        owner: additionalTelephone.owner || "",
      };
      formDataRef.current = data;
      setFormData(data);
    }
  }, [
    additionalTelephone?.phone,
    additionalTelephone?.name,
    additionalTelephone?.owner,
  ]);

  const handleFieldChange = (fieldName, value) => {
    const newFormData = { ...formDataRef.current, [fieldName]: value };
    formDataRef.current = newFormData;
    setFormData(newFormData);

    if (fieldName === "phone") {
      const normalizePhone = (p) => p?.replace(/\D/g, "");
      const isDuplicate =
        value && normalizePhone(value) === normalizePhone(userData?.phone);

      const err = !value
        ? "Поле обязательно"
        : isDuplicate
        ? "Этот номер уже используется как основной"
        : !/^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/.test(value)
        ? "Некорректный номер телефона"
        : "";

      setErrors((prev) => ({ ...prev, phone: err }));
      if (!err && value) debouncedUpdate(newFormData);
    }

    if (fieldName === "name") {
      const err = !value
        ? "Поле обязательно"
        : value.trim().length < 5
        ? "Введите корректное ФИО"
        : "";
      setErrors((prev) => ({ ...prev, name: err }));
      if (!err && value) debouncedUpdate(newFormData);
    }

    if (fieldName === "owner") {
      debouncedUpdate(newFormData);
    }
  };

  onAcceptRef.current = ({ value }) => {
    handleFieldChange("phone", value);
  };

  const { inputRef: phoneInputRef } = usePhoneMask({
    onAccept: (...args) => onAcceptRef.current?.(...args),
    initialValue: additionalTelephone?.phone || "",
  });

  const screenWidth = useScreenWidth();
  const placeholder = screenWidth < 780 ? "Номер телефона" : "Номер телефона";

  return (
    <section className={style.additional_telephone}>
      <div className={style.additional_telephone__wrapper}>
        <h2>Дополнительный телефон</h2>

        <ul>
          <div>
            <li className={errors.phone ? style.li_error : ""}>
              <InputField
                icon={Phone}
                label="Номер дополнительного телефона"
                placeholder={placeholder}
                id="phone"
                type="tel"
                ref={phoneInputRef}
                inputMode="numeric"
              />
            </li>
            {errors.phone && (
              <span className={style.input_error_text}>{errors.phone}</span>
            )}
          </div>

          <li>
            <CustomSelect
              icon={Person}
              label=""
              placeholder="Владелец телефона"
              defaultValue={
                additionalTelephone?.owner
                  ? {
                      value: additionalTelephone.owner,
                      title: additionalTelephone.owner,
                    }
                  : null
              }
              options={[
                { value: "Номер родственника", title: "Номер родственника" },
                { value: "Номер друга", title: "Номер друга" },
              ]}
              onChange={(option) => handleFieldChange("owner", option.value)}
            />
          </li>

          <div>
            <li className={errors.name ? style.li_error : ""}>
              <InputField
                icon={Mail}
                label="ФИО владельца телефона"
                placeholder="ФИО"
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
              />
            </li>
            {errors.name && (
              <span className={style.input_error_text}>{errors.name}</span>
            )}
          </div>
        </ul>
      </div>
    </section>
  );
};

export default AdditionalTelephone;
