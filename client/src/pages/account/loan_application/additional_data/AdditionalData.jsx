import React, { useEffect, useRef, useState } from "react";
import style from "./additionaldata.module.scss";
import { ReactComponent as Education } from "../../../../assets/icons/account/education.svg";
import { ReactComponent as Person } from "../../../../assets/icons/person.svg";
import { ReactComponent as People } from "../../../../assets/icons/account/people.svg";
import { ReactComponent as Car } from "../../../../assets/icons/account/car.svg";
import InputField from "../../../../components/input_field/InputField";
import CustomSelect from "../../../../components/CustomSelect/CustomSelect";
import { useDispatch, useSelector } from "react-redux";
import { useDebouncedUpdate } from "../../../../hooks/useDebouncedUpdate";
import {
  updateUser,
  clearError,
} from "../../../../redux/slices/user/updateUserSlice";
import Notification from "../../../../components/notification/Notification";
import Checkbox from "../../../../components/checkbox/Checkbox";

const EDUCATION_OPTIONS = [
  { value: "Высшее", title: "Высшее" },
  { value: "Среднее", title: "Среднее" },
  { value: "Средне специальное", title: "Средне специальное" },
  { value: "Неоконченное высшее", title: "Неоконченное высшее" },
];

const MARITAL_OPTIONS = [
  { value: "Женат / Замужем", title: "Женат / Замужем" },
  { value: "Холост / Не замужем", title: "Холост / Не замужем" },
  { value: "Разведён / Разведена", title: "Разведён / Разведена" },
  {
    value: "Гражданский брак",
    title: "Гражданский брак",
  },
  { value: "Вдовец / Вдова", title: "Вдовец / Вдова" },
];

const CHILDREN_OPTIONS = [
  { value: "Нет детей", title: "Нет детей" },
  { value: "1", title: "1" },
  { value: "2", title: "2" },
  { value: "3", title: "3" },
  { value: "4 и более", title: "4 и более" },
];

const AdditionalData = () => {
  const dispatch = useDispatch();
  const additionalData = useSelector(
    (state) => state.auth.user?.data?.additional_data
  );

  const formDataRef = useRef({
    education: "",
    marital_status: "",
    children: "",
    has_property: false,
    has_car: false,
    car_number: "",
  });

  const [formData, setFormData] = useState(formDataRef.current);
  const [errors, setErrors] = useState({});

  const debouncedUpdate = useDebouncedUpdate((data) => {
    dispatch(clearError());
    dispatch(updateUser({ additional_data: data }));
  }, 3000);

  useEffect(() => {
    if (additionalData) {
      const data = {
        education: additionalData.education || "",
        marital_status: additionalData.marital_status || "",
        children: additionalData.children || "",
        has_property: additionalData.has_property || false,
        has_car: additionalData.has_car || false,
        car_number: additionalData.car_number || "",
      };
      formDataRef.current = data;
      setFormData(data);
    }
  }, [
    additionalData?.education,
    additionalData?.marital_status,
    additionalData?.children,
    additionalData?.has_property,
    additionalData?.has_car,
    additionalData?.car_number,
  ]);

  const handleFieldChange = (fieldName, value) => {
    const newFormData = { ...formDataRef.current, [fieldName]: value };
    formDataRef.current = newFormData;
    setFormData(newFormData);

    if (fieldName === "car_number") {
      const err =
        value && value.trim().length < 3 ? "Введите корректный номер" : "";
      setErrors((prev) => ({ ...prev, car_number: err }));
      if (!err) debouncedUpdate(newFormData);
      return;
    }

    debouncedUpdate(newFormData);
  };

  return (
    <section className={style.additional_data}>
      <div className={style.additional_data__wrapper}>
        <h2>Дополнительные данные</h2>

        {/* <Notification text="Чем больше заполните полей, тем выше процент одобрения заявки" /> */}

        <ul className={style.selects_row}>
          <li>
            <CustomSelect
              icon={Education}
              label="Образование"
              placeholder="Выберите из списка"
              defaultValue={
                additionalData?.education
                  ? {
                      value: additionalData.education,
                      title: additionalData.education,
                    }
                  : null
              }
              options={EDUCATION_OPTIONS}
              onChange={(option) =>
                handleFieldChange("education", option.value)
              }
            />
          </li>

          <li>
            <CustomSelect
              icon={Person}
              label="Семейное положение"
              placeholder="Выберите из списка"
              defaultValue={
                additionalData?.marital_status
                  ? {
                      value: additionalData.marital_status,
                      title: additionalData.marital_status,
                    }
                  : null
              }
              options={MARITAL_OPTIONS}
              onChange={(option) =>
                handleFieldChange("marital_status", option.value)
              }
            />
          </li>

          <li>
            <CustomSelect
              icon={People}
              label="Дети до 18 лет"
              placeholder="Выберите из списка"
              defaultValue={
                additionalData?.children
                  ? {
                      value: additionalData.children,
                      title: additionalData.children,
                    }
                  : null
              }
              options={CHILDREN_OPTIONS}
              onChange={(option) => handleFieldChange("children", option.value)}
            />
          </li>
        </ul>

        <div className={style.property_section}>
          <h3>Наличие имущества</h3>

          <div className={style.property_section__checkboxes}>
            <div className={style.property_section__row}>
              <Checkbox
                isChecked={formData.has_property}
                setIsChecked={(val) => handleFieldChange("has_property", val)}
              />
              <span>Есть недвижимость</span>
            </div>

            <div className={style.property_section__row}>
              <Checkbox
                isChecked={formData.has_car}
                setIsChecked={(val) => handleFieldChange("has_car", val)}
              />
              <span>Есть автомобиль</span>
            </div>
          </div>

          {formData.has_car && (
            <ul className={style.car_field}>
              <div>
                <li className={errors.car_number ? style.li_error : ""}>
                  <InputField
                    icon={Car}
                    label="Гос. номер автомобиля"
                    placeholder="Необходимо указать"
                    id="car_number"
                    type="text"
                    name="car_number"
                    value={formData.car_number}
                    onChange={(e) =>
                      handleFieldChange("car_number", e.target.value)
                    }
                  />
                </li>
                {errors.car_number && (
                  <span className={style.input_error_text}>
                    {errors.car_number}
                  </span>
                )}
              </div>
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdditionalData;
