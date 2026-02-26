import React, { useState, useEffect, useRef } from "react";
import style from "./passport.module.scss";
import { ReactComponent as PassportIcon } from "../../../../assets/icons/account/passport.svg";
import InputField from "../../../../components/input_field/InputField";
import { useIMask } from "../../../../hooks/useIMask";
import IMask from "imask";
import { ReactComponent as Bag } from "../../../../assets/icons/account/bag.svg";
import { ReactComponent as Town } from "../../../../assets/icons/account/town.svg";
import { useDispatch, useSelector } from "react-redux";
import { useDebouncedUpdate } from "../../../../hooks/useDebouncedUpdate";
import {
  updateUser,
  clearError,
} from "../../../../redux/slices/user/updateUserSlice";

const Passport = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth);
  const initialized = useRef(false);

  const formDataRef = useRef({
    series_number: "",
    date: "",
    department_code: "",
    issued_by: "",
    birth: "",
    place_of_birth: "",
  });

  const [formData, setFormData] = useState(formDataRef.current);
  const [errors, setErrors] = useState({});

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

  const [passportRef] = useIMask(
    { mask: "0000 000000", lazy: true },
    (value) => {
      handleFieldChange("series_number", value);
    }
  );

  const [dateRef] = useIMask(dateMask, (value) => {
    handleFieldChange("date", value);
  });

  const [departmentRef] = useIMask({ mask: "000-000", lazy: true }, (value) => {
    handleFieldChange("department_code", value);
  });

  const [dateInputRef] = useIMask(dateMask, (value) => {
    handleFieldChange("birth", value);
  });

  const debouncedUpdate = useDebouncedUpdate((data) => {
    dispatch(clearError());
    dispatch(updateUser({ passport: data }));
  }, 3000);

  useEffect(() => {
    if (
      !initialized.current &&
      user.status === "succeeded" &&
      user.user.data?.passport
    ) {
      const data = {
        series_number: user.user.data.passport.series_number || "",
        date: user.user.data.passport.date || "",
        department_code: user.user.data.passport.department_code || "",
        issued_by: user.user.data.passport.issued_by || "",
        birth: user.user.data.passport.birth || "",
        place_of_birth: user.user.data.passport.place_of_birth || "",
      };
      formDataRef.current = data;
      setFormData(data);
      initialized.current = true;
    }
  }, [user]);

  const validateDate = (value) => {
    if (!value) return "Поле обязательно";
    if (value.length < 10) return "Введите полную дату";
    const [day, month, year] = value.split(".");
    const date = new Date(`${year}-${month}-${day}`);
    if (isNaN(date.getTime())) return "Некорректная дата";
    return "";
  };

  const validate = (fieldName, value) => {
    switch (fieldName) {
      case "series_number":
        if (!value) return "Поле обязательно";
        if (value.replace(" ", "").length < 10)
          return "Введите полную серию и номер";
        return "";
      case "date":
        return validateDate(value);
      case "department_code":
        if (!value) return "Поле обязательно";
        if (value.replace("-", "").length < 6) return "Введите полный код";
        return "";
      case "issued_by":
        if (!value) return "Поле обязательно";
        if (value.trim().length < 5) return "Минимум 5 символов";
        return "";
      case "birth":
        return validateDate(value);
      case "place_of_birth":
        if (!value) return "Поле обязательно";
        if (value.trim().length < 3) return "Минимум 3 символа";
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = (fieldName, value) => {
    const newFormData = { ...formDataRef.current, [fieldName]: value };
    formDataRef.current = newFormData;
    setFormData(newFormData);

    const err = validate(fieldName, value);
    const newErrors = { ...errors, [fieldName]: err };
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((e) => e);
    if (!hasErrors) {
      debouncedUpdate(newFormData);
    }
  };

  const handleChange = (e) => {
    handleFieldChange(e.target.name, e.target.value);
  };

  return (
    <section className={style.passport}>
      <div className={style.passport__wrapper}>
        <h2>Паспортные данные</h2>

        <ul>
          <div>
            <li className={errors.series_number ? style.li_error : ""}>
              <div className={style.passport__item__text}>
                <InputField
                  label="Серия и номер паспорта"
                  placeholder="Серия и номер"
                  id="passport-number"
                  type="text"
                  value={formData.series_number}
                  icon={PassportIcon}
                  inputMode="numeric"
                  ref={passportRef}
                />
              </div>
            </li>
            {errors.series_number && (
              <span className={style.error_text}>{errors.series_number}</span>
            )}
          </div>

          <div>
            <li className={errors.date ? style.li_error : ""}>
              <div className={style.passport__item__text}>
                <InputField
                  label="Дата выдачи"
                  placeholder="Дата выдачи"
                  id="issue-date"
                  type="text"
                  value={formData.date}
                  icon={PassportIcon}
                  inputMode="numeric"
                  ref={dateRef}
                />
              </div>
            </li>
            {errors.date && (
              <span className={style.error_text}>{errors.date}</span>
            )}
          </div>

          <div>
            <li className={errors.department_code ? style.li_error : ""}>
              <div className={style.passport__item__text}>
                <InputField
                  label="Код подразделения"
                  placeholder="Код подразделения"
                  id="department-code"
                  type="text"
                  value={formData.department_code}
                  icon={PassportIcon}
                  inputMode="numeric"
                  ref={departmentRef}
                />
              </div>
            </li>
            {errors.department_code && (
              <span className={style.error_text}>{errors.department_code}</span>
            )}
          </div>

          <div>
            <li className={errors.issued_by ? style.li_error : ""}>
              <div className={style.passport__item__text}>
                <InputField
                  label="Кем выдан"
                  placeholder="Кем выдан"
                  id="issued-by"
                  type="text"
                  name="issued_by"
                  value={formData.issued_by}
                  icon={PassportIcon}
                  onChange={handleChange}
                />
              </div>
            </li>
            {errors.issued_by && (
              <span className={style.error_text}>{errors.issued_by}</span>
            )}
          </div>
        </ul>

        <ul>
          <div>
            <li className={errors.birth ? style.li_error : ""}>
              <div className={style.passport__item__text}>
                <InputField
                  label="Дата рождения"
                  placeholder="Дата рождения"
                  id="birth-date"
                  type="text"
                  value={formData.birth}
                  inputMode="numeric"
                  icon={Bag}
                  ref={dateInputRef}
                />
              </div>
            </li>
            {errors.birth && (
              <span className={style.error_text}>{errors.birth}</span>
            )}
          </div>

          <div>
            <li className={errors.place_of_birth ? style.li_error : ""}>
              <div className={style.passport__item__text}>
                <InputField
                  label="Место рождения"
                  placeholder="Место рождения"
                  id="birth-place"
                  type="text"
                  name="place_of_birth"
                  value={formData.place_of_birth}
                  icon={Town}
                  onChange={handleChange}
                />
              </div>
            </li>
            {errors.place_of_birth && (
              <span className={style.error_text}>{errors.place_of_birth}</span>
            )}
          </div>
        </ul>
      </div>
    </section>
  );
};

export default Passport;
