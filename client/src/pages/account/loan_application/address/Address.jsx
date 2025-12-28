import React, { useState } from "react";
import style from "./address.module.scss";
import { ReactComponent as Location } from "../../../../assets/icons/account/location.svg";
import { ReactComponent as Passport } from "../../../../assets/icons/account/passport.svg";
import Checkbox from "../../../../components/checkbox/Checkbox";
import InputField from "../../../../components/input_field/InputField";
import { useIMask } from "../../../../hooks/useIMask";
import IMask from "imask";

const Address = ({ setIsChecked, isChecked }) => {
  const [streetAddress, setStreetAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");

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

  const [registrationDateRef] = useIMask(
    registrationDateMask,
    setRegistrationDate
  );

  const apartmentMask = {
    mask: "00000",
    lazy: true,
  };

  const [apartmentRef] = useIMask(apartmentMask, setApartment);

  return (
    <section className={style.address}>
      <div className={style.address__wrapper}>
        <h2>Адрес регистрации</h2>

        <div className={style.address__container}>
          <div className={style.address__item__text__container}>
            <div className={style.address__item__text}>
              <InputField
                label="Населённый пункт, улица, дом"
                placeholder="Например: г. Москва, ул. Ленина, д. 10"
                id="street-address"
                type="text"
                value={streetAddress}
                icon={Location}
                onChange={(e) => setStreetAddress(e.target.value)}
              />
            </div>

            <div className={style.address__item__text}>
              <InputField
                label="Квартира"
                placeholder="Номер квартиры"
                id="apartment"
                type="text"
                inputMode="numeric"
                value={apartment}
                icon={Location}
                ref={apartmentRef}
              />
            </div>

            <div className={style.address__item__text}>
              <InputField
                label="Дата регистрации"
                placeholder="Укажите дату регистрации"
                id="registration-date"
                type="text"
                value={registrationDate}
                icon={Passport}
                inputMode="numeric"
                ref={registrationDateRef}
              />
            </div>
          </div>
        </div>

        <div
          className={style.address__check}
          onClick={() => setIsChecked(!isChecked)}
        >
          <Checkbox setIsChecked={setIsChecked} isChecked={isChecked} />
          <p>Адрес фактического проживания совпадает с адресом регистрации</p>
        </div>
      </div>
    </section>
  );
};

export default Address;
