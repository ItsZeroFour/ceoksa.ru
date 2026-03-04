import React, { useEffect, useRef, useState } from "react";
import style from "./placeofwork.module.scss";
import { ReactComponent as Work } from "../../../../assets/icons/account/work.svg";
import { ReactComponent as Phone } from "../../../../assets/icons/account/phone.svg";
import InputField from "../../../../components/input_field/InputField";
import CustomSelect from "../../../../components/CustomSelect/CustomSelect";
import { usePhoneMask } from "../../../../hooks/usePhoneMask";
import { useIMask } from "../../../../hooks/useIMask";
import IMask from "imask";
import { useDispatch, useSelector } from "react-redux";
import { useDebouncedUpdate } from "../../../../hooks/useDebouncedUpdate";
import {
  updateUser,
  clearError,
} from "../../../../redux/slices/user/updateUserSlice";

const EMPLOYMENT_TYPES = [
  { value: "Не работаю", title: "Не работаю" },
  { value: "Работа по найму", title: "Работа по найму" },
  { value: "Собственный бизнес", title: "Собственный бизнес" },
  { value: "Самозанятый", title: "Самозанятый" },
  { value: "Пенсионер", title: "Пенсионер" },
];

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

const PlaceOfWork = () => {
  const dispatch = useDispatch();
  const placeOfWork = useSelector(
    (state) => state.auth.user?.data?.place_of_work
  );

  const formDataRef = useRef({
    employment_type: "",
    organization_name: "",
    start_date: "",
    work_phone: "",
    position: "",
  });

  const [formData, setFormData] = useState(formDataRef.current);
  const [errors, setErrors] = useState({});
  const onAcceptRef = useRef(null);

  const debouncedUpdate = useDebouncedUpdate((data) => {
    dispatch(clearError());
    dispatch(updateUser({ place_of_work: data }));
  }, 3000);

  useEffect(() => {
    if (placeOfWork) {
      const data = {
        employment_type: placeOfWork.employment_type || "",
        organization_name: placeOfWork.organization_name || "",
        start_date: placeOfWork.start_date || "",
        work_phone: placeOfWork.work_phone || "",
        position: placeOfWork.position || "",
      };
      formDataRef.current = data;
      setFormData(data);
    }
  }, [
    placeOfWork?.employment_type,
    placeOfWork?.organization_name,
    placeOfWork?.start_date,
    placeOfWork?.work_phone,
    placeOfWork?.position,
  ]);

  const handleFieldChange = (fieldName, value) => {
    const newFormData = { ...formDataRef.current, [fieldName]: value };
    formDataRef.current = newFormData;
    setFormData(newFormData);

    if (fieldName === "organization_name") {
      const err = !value
        ? "Поле обязательно"
        : value.trim().length < 2
        ? "Введите корректное название организации"
        : "";
      setErrors((prev) => ({ ...prev, organization_name: err }));
      if (!err && value) debouncedUpdate(newFormData);
    }

    if (fieldName === "work_phone") {
      const err =
        value && !/^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/.test(value)
          ? "Некорректный номер телефона"
          : "";
      setErrors((prev) => ({ ...prev, work_phone: err }));
      if (!err) debouncedUpdate(newFormData);
    }

    if (fieldName === "position") {
      const err = !value
        ? "Поле обязательно"
        : value.trim().length < 2
        ? "Введите корректное название должности"
        : "";
      setErrors((prev) => ({ ...prev, position: err }));
      if (!err && value) debouncedUpdate(newFormData);
    }

    if (fieldName === "employment_type" || fieldName === "start_date") {
      debouncedUpdate(newFormData);
    }
  };

  onAcceptRef.current = ({ value }) => {
    handleFieldChange("work_phone", value);
  };

  const { inputRef: phoneInputRef } = usePhoneMask({
    onAccept: (...args) => onAcceptRef.current?.(...args),
    initialValue: placeOfWork?.work_phone || "",
  });

  const startDateInitialized = useRef(false);

  const [startDateRef] = useIMask(dateMask, (value) => {
    const err = value && value.length < 10 ? "Введите полную дату" : "";
    setErrors((prev) => ({ ...prev, start_date: err }));
    if (!err) {
      const newFormData = { ...formDataRef.current, start_date: value };
      formDataRef.current = newFormData;
      setFormData(newFormData);
      debouncedUpdate(newFormData);
    }
  });

  useEffect(() => {
    if (
      !startDateInitialized.current &&
      placeOfWork?.start_date &&
      startDateRef.current
    ) {
      startDateRef.current.value = placeOfWork.start_date;
      startDateRef.current.dispatchEvent(new Event("input", { bubbles: true }));
      startDateInitialized.current = true;
    }
  }, [placeOfWork?.start_date]);

  const showExtraFields =
    formData.employment_type === "Работа по найму" ||
    formData.employment_type === "Собственный бизнес";

  const showPosition = formData.employment_type === "Работа по найму";

  return (
    <section className={style.place_of_work}>
      <div className={style.place_of_work__wrapper}>
        <h2>Место работы</h2>

        <ul>
          <li>
            <CustomSelect
              icon={Work}
              label="Тип занятости"
              placeholder="Выберите тип занятости"
              defaultValue={
                placeOfWork?.employment_type
                  ? {
                      value: placeOfWork.employment_type,
                      title: placeOfWork.employment_type,
                    }
                  : null
              }
              options={EMPLOYMENT_TYPES}
              onChange={(option) =>
                handleFieldChange("employment_type", option.value)
              }
            />
          </li>

          {showExtraFields && (
            <>
              <div>
                <li className={errors.organization_name ? style.li_error : ""}>
                  <InputField
                    icon={Work}
                    label="Название организации"
                    placeholder="Название организации"
                    id="organization_name"
                    type="text"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={(e) =>
                      handleFieldChange("organization_name", e.target.value)
                    }
                  />
                </li>
                {errors.organization_name && (
                  <span className={style.input_error_text}>
                    {errors.organization_name}
                  </span>
                )}
              </div>

              <div>
                <li className={errors.start_date ? style.li_error : ""}>
                  <InputField
                    icon={Work}
                    label="Начало работы"
                    placeholder="Дата начала работы"
                    id="start_date"
                    type="text"
                    inputMode="numeric"
                    ref={startDateRef}
                  />
                </li>
                {errors.start_date && (
                  <span className={style.input_error_text}>
                    {errors.start_date}
                  </span>
                )}
              </div>

              <div>
                <li className={errors.work_phone ? style.li_error : ""}>
                  <InputField
                    icon={Phone}
                    label="Рабочий телефон"
                    placeholder="Рабочий телефон"
                    id="work_phone"
                    type="tel"
                    ref={phoneInputRef}
                  />
                </li>
                {errors.work_phone && (
                  <span className={style.input_error_text}>
                    {errors.work_phone}
                  </span>
                )}
              </div>

              {showPosition && (
                <div>
                  <li className={errors.position ? style.li_error : ""}>
                    <InputField
                      icon={Work}
                      label="Название должности"
                      placeholder="Название должности"
                      id="position"
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={(e) =>
                        handleFieldChange("position", e.target.value)
                      }
                    />
                  </li>
                  {errors.position && (
                    <span className={style.input_error_text}>
                      {errors.position}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </ul>
      </div>
    </section>
  );
};

export default PlaceOfWork;
