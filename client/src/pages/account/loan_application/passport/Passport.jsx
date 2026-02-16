import React, { useState, useEffect } from "react";
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

  const [formData, setFormData] = useState({
    series_number: "",
    date: "",
    department_code: "",
    issued_by: "",
    birth: "",
    place_of_birth: "",
  });

  const passportMask = {
    mask: "0000 000000",
    lazy: true,
    placeholderChar: "_",
  };
  const [passportRef] = useIMask(passportMask, (value) => {
    handleFieldChange("series_number", value);
  });

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
  const [dateRef] = useIMask(dateMask, (value) => {
    handleFieldChange("date", value);
  });

  const departmentMask = {
    mask: "000-000",
    lazy: true,
    placeholderChar: "_",
  };
  const [departmentRef] = useIMask(departmentMask, (value) => {
    handleFieldChange("department_code", value);
  });

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

  const [dateInputRef] = useIMask(dateMask2, (value) => {
    handleFieldChange("birth", value);
  });

  const debouncedUpdate = useDebouncedUpdate((data) => {
    dispatch(clearError());
    dispatch(
      updateUser({
        passport: data,
      })
    );
  }, 3000);

  useEffect(() => {
    if (user.status === "succeeded" && user.user.data?.passport) {
      setFormData({
        series_number: user.user.data.passport.series_number || "",
        date: user.user.data.passport.date || "",
        department_code: user.user.data.passport.department_code || "",
        issued_by: user.user.data.passport.issued_by || "",
        birth: user.user.data.passport.birth || "",
        place_of_birth: user.user.data.passport.place_of_birth || "",
      });
    }
  }, [user]);

  const handleFieldChange = (fieldName, value) => {
    const newFormData = {
      ...formData,
      [fieldName]: value,
    };

    setFormData(newFormData);
    debouncedUpdate(newFormData);
  };

  const handleChange = (e) => {
    handleFieldChange(e.target.name, e.target.value);
  };

  return (
    <section className={style.passport}>
      <div className={style.passport__wrapper}>
        <h2>Паспортные данные</h2>

        <ul>
          <li>
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

          <li>
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

          <li>
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

          <li>
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
        </ul>

        <ul>
          <li>
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

          <li>
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
        </ul>
      </div>
    </section>
  );
};

export default Passport;
