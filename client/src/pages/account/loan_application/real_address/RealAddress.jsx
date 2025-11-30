import React from "react";
import style from "./realaddress.module.scss";
import { ReactComponent as Location } from "../../../../assets/icons/account/location.svg";
import { ReactComponent as Edit } from "../../../../assets/icons/account/edit.svg";
import { useValidation } from "../../../../hooks/useValidation";
import { useScreenWidth } from "../../../../hooks/useScreenWidth";

const RealAddress = () => {
  const { getFieldProps, hasError, errors } = useValidation(
    { city: "", home: "" },
    {
      city: [
        (v) => (!v ? "Поле обязательно" : ""),
        (v) => (v.length < 3 ? "Минимум 3 символа" : ""),
      ],
      home: [(v) => (!v ? "Поле обязательно" : "")],
    }
  );

  const screenWidth = useScreenWidth();

  const cityPlaceholder =
    screenWidth < 780
      ? "Нас. пункт, улица, дом"
      : "Необходимо указать Населённый пункт, улицу, дом";

  const homePlaceholder =
    screenWidth < 780 ? "Номер квартиры" : "Необходимо указать номер";

  const handleNumbersOnly = (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
  };

  const homeFieldProps = getFieldProps("home");

  return (
    <div className={style.real_address}>
      <div className={style.real_address__wrapper}>
        <h2>Адрес фактического проживания</h2>

        <div className={style.real_address__main}>
          <div className={style.real_address__item__icon}>
            <Location />
          </div>

          <form>
            <div
              className={
                hasError("city")
                  ? `${style.real_address__form__item} ${style.error}`
                  : style.real_address__form__item
              }
            >
              <label htmlFor="city">Населённый пункт, улица, дом</label>
              <input
                type="text"
                id="city"
                placeholder={cityPlaceholder}
                {...getFieldProps("city")}
              />
              <Edit />
              {hasError("city") && (
                <span className={style.error_text}>{errors.city}</span>
              )}
            </div>

            <div
              className={
                hasError("home")
                  ? `${style.real_address__form__item} ${style.error}`
                  : style.real_address__form__item
              }
            >
              <label htmlFor="home">Квартира</label>
              <input
                type="number"
                id="home"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={homePlaceholder}
                {...homeFieldProps}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                  homeFieldProps.onInput?.(e);
                }}
              />
              <Edit />
              {hasError("home") && (
                <span className={style.error_text}>{errors.home}</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RealAddress;
