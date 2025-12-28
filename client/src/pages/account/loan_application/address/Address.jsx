import React, { useState } from "react";
import style from "./address.module.scss";
import { ReactComponent as Location } from "../../../../assets/icons/account/location.svg";
import { ReactComponent as Passport } from "../../../../assets/icons/account/passport.svg";
import Checkbox from "../../../../components/checkbox/Checkbox";
import InputField from "../../../../components/input_field/InputField";

const Address = ({ setIsChecked, isChecked }) => {
  const [streetAddress, setStreetAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");

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
                value={apartment}
                icon={Location}
                onChange={(e) => setApartment(e.target.value)}
              />
            </div>

            <div className={style.address__item__text}>
              <InputField
                label="Дата регистрации"
                placeholder="Например: 18 октября 1998"
                id="registration-date"
                type="text"
                value={registrationDate}
                icon={Passport}
                onChange={(e) => setRegistrationDate(e.target.value)}
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
