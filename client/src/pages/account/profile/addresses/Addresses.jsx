import React from "react";
import style from "./addresses.module.scss";
import gosuslugi from "../../../../assets/gosuslugi.png";
import { ReactComponent as Location } from "../../../../assets/icons/profile/location.svg";
import { ReactComponent as Edit } from "../../../../assets/icons/account/edit.svg";
import { useScreenWidth } from "../../../../hooks/useScreenWidth";

const Addresses = ({ user }) => {
  const screenWidth = useScreenWidth();

  const addressPlaceholder =
    screenWidth < 780
      ? "Укажите адрес"
      : "Необходимо указать фактический адрес";

  return (
    <div className={style.addresses}>
      <div className={style.addresses__wrapper}>
        <h2>Адреса</h2>

        <ul>
          <li>
            <div className={style.addresses__item__main}>
              <div className={style.addresses__item__icon}>
                <Location />
              </div>

              <div className={style.addresses__item__text}>
                <p>Адрес регистрации</p>
                <p>{user?.address?.street || "-"}</p>
              </div>
            </div>

            {/* <img src={gosuslugi} alt="Госуслуги" /> */}
          </li>

          <li>
            <div className={style.addresses__item__main}>
              <div className={style.addresses__item__icon}>
                <Location />
              </div>

              <div className={style.addresses__form__item}>
                <label htmlFor="address">Фактический адрес</label>
                {/* <input
                  type="text"
                  id="address"
                  placeholder={
                    user.address_doesnt_match
                      ? user?.real_address?.street
                      : user?.address?.street || "-"
                  }
                  readOnly={true}
                  value={
                    user.address_doesnt_match
                      ? user?.real_address?.street
                      : user?.address?.street || "-"
                  }
                /> */}

                <p>
                  {(user?.address_doesnt_match
                    ? user?.real_address?.street
                    : user?.address?.street) || "-"}
                </p>
                {/* <Edit /> */}
              </div>
            </div>

            {/* <img src={gosuslugi} alt="Госуслуги" /> */}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Addresses;
