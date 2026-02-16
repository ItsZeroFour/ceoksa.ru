import React, { useEffect, useRef } from "react";
import style from "./realaddress.module.scss";
import { ReactComponent as Location } from "../../../../assets/icons/account/location.svg";
import { ReactComponent as Edit } from "../../../../assets/icons/account/edit.svg";
import { useValidation } from "../../../../hooks/useValidation";
import { useScreenWidth } from "../../../../hooks/useScreenWidth";
import { useDispatch, useSelector } from "react-redux";
import { useDebouncedUpdate } from "../../../../hooks/useDebouncedUpdate";
import {
  updateUser,
  clearError,
} from "../../../../redux/slices/user/updateUserSlice";

const RealAddress = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth);
  const isInitialized = useRef(false);

  // Инициализируем с данными из Redux, если они есть
  const initialValues = {
    street: user?.user?.data?.real_address?.street || "",
    apartment: user?.user?.data?.real_address?.apartment || "",
  };

  const { getFieldProps, hasError, errors, values } = useValidation(
    initialValues,
    {
      street: [
        (v) => (!v ? "Поле обязательно" : ""),
        (v) => (v.length < 3 ? "Минимум 3 символа" : ""),
      ],
      apartment: [(v) => (!v ? "Поле обязательно" : "")],
    }
  );

  const screenWidth = useScreenWidth();

  // Используем хук для отложенного обновления
  const debouncedUpdate = useDebouncedUpdate((data) => {
    dispatch(clearError());
    dispatch(
      updateUser({
        real_address: data,
      })
    );
  }, 3000);

  // Отслеживаем изменения values и сохраняем их
  useEffect(() => {
    // Пропускаем первый рендер (инициализацию)
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

    // Сохраняем только если есть изменения
    if (values.street || values.apartment) {
      debouncedUpdate({
        street: values.street,
        apartment: values.apartment,
      });
    }
  }, [values.street, values.apartment, debouncedUpdate]);

  const cityPlaceholder =
    screenWidth < 780
      ? "Нас. пункт, улица, дом"
      : "Необходимо указать Населённый пункт, улицу, дом";

  const homePlaceholder =
    screenWidth < 780 ? "Номер квартиры" : "Необходимо указать номер";

  const apartmentFieldProps = getFieldProps("apartment");

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
                hasError("street")
                  ? `${style.real_address__form__item} ${style.error}`
                  : style.real_address__form__item
              }
            >
              <label htmlFor="street">Населённый пункт, улица, дом</label>
              <input
                type="text"
                id="street"
                placeholder={cityPlaceholder}
                {...getFieldProps("street")}
              />
              <Edit />
              {hasError("street") && (
                <span className={style.error_text}>{errors.street}</span>
              )}
            </div>

            <div
              className={
                hasError("apartment")
                  ? `${style.real_address__form__item} ${style.error}`
                  : style.real_address__form__item
              }
            >
              <label htmlFor="apartment">Квартира</label>
              <input
                type="number"
                id="apartment"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={homePlaceholder}
                {...apartmentFieldProps}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                  apartmentFieldProps.onInput?.(e);
                }}
              />
              <Edit />
              {hasError("apartment") && (
                <span className={style.error_text}>{errors.apartment}</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RealAddress;
