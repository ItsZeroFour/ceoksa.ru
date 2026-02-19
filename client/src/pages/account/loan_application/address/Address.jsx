import React, { useState, useEffect } from "react";
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

  const [formData, setFormData] = useState({
    street: "",
    apartment: "",
    registration_date: "",
  });

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

  const apartmentMask = {
    mask: "00000",
    lazy: true,
  };

  const [apartmentRef] = useIMask(apartmentMask, (value) => {
    handleFieldChange("apartment", value);
  });

  const debouncedUpdate = useDebouncedUpdate((data) => {
    dispatch(clearError());
    dispatch(
      updateUser({
        address: data,
      })
    );
  }, 3000);

  useEffect(() => {
    if (user.status === "succeeded" && user.user.data) {
      if (user.user.data.address) {
        setFormData({
          street: user.user.data.address.street || "",
          apartment: user.user.data.address.apartment || "",
          registration_date: user.user.data.address.registration_date || "",
        });
      }

      if (user.user.data.address_doesnt_match !== undefined) {
        setIsChecked(!user.user.data.address_doesnt_match);
      }
    }
  }, [user, setIsChecked]);

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

  const handleCheckboxChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);

    dispatch(clearError());
    dispatch(
      updateUser({
        address_doesnt_match: !newCheckedState,
      })
    );
  };

  return (
    <section className={style.address}>
      <div className={style.address__wrapper}>
        <h2>Адрес регистрации</h2>

        <div className={style.address__container}>
          <div className={style.address__item__text__container}>
            <div className={style.address__item__text}>
              <InputField
                label="Населённый пункт, улица, дом"
                placeholder="Например: г. Москва, ул. Ленина, д. 10, кв. 12"
                id="street-address"
                type="text"
                name="street"
                value={formData.street}
                icon={Location}
                onChange={handleChange}
              />
            </div>

            {/* <div className={style.address__item__text}>
              <InputField
                label="Квартира"
                placeholder="Номер квартиры"
                id="apartment"
                type="text"
                inputMode="numeric"
                value={formData.apartment}
                icon={Location}
                ref={apartmentRef}
              />
            </div> */}

            <div className={style.address__item__text}>
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
