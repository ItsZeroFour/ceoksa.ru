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
  const realAddress = useSelector(
    (state) => state.auth.user?.data?.real_address
  );
  const isInitialized = useRef(false);

  const initialValues = useRef({
    street: realAddress?.street || "",
    apartment: realAddress?.apartment || "",
  });

  const validators = useRef({
    street: [
      (v) => (!v ? "Поле обязательно" : ""),
      (v) => (v.length < 10 ? "Минимум 10 символа" : ""),
    ],
    apartment: [(v) => (!v ? "Поле обязательно" : "")],
  });

  const { getFieldProps, hasError, errors, values } = useValidation(
    initialValues.current,
    validators.current
  );

  const screenWidth = useScreenWidth();

  const debouncedUpdate = useDebouncedUpdate((data) => {
    dispatch(clearError());
    dispatch(
      updateUser({ real_address: data, manual_real_address: data })
    );
  }, 3000);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

    if (hasError("street") || hasError("apartment")) return;

    if (values.street || values.apartment) {
      debouncedUpdate({
        street: values.street,
        apartment: values.apartment,
      });
    }
  }, [values.street, values.apartment]);

  const cityPlaceholder =
    screenWidth < 780
      ? "Нас. пункт, улица, дом, кв."
      : "Нас. пункт, улица, дом, квартира";

  return (
    <div className={style.real_address}>
      <div className={style.real_address__wrapper}>
        <h2>Адрес фактического проживания</h2>

        <div
          className={
            hasError("street")
              ? `${style.real_address__main} ${style.error}`
              : style.real_address__main
          }
        >
          <div className={style.real_address__item__icon}>
            <Location />
          </div>

          <form>
            <div className={style.real_address__form__item__wrapper}>
              <div className={style.real_address__form__item}>
                {/* <label htmlFor="street">
                  Населённый пункт, улица, дом, квартира
                </label> */}
                <input
                  type="text"
                  id="street"
                  placeholder={cityPlaceholder}
                  {...getFieldProps("street")}
                />
                <Edit />
              </div>
            </div>
          </form>
        </div>

        {hasError("street") && (
          <span className={style.error_text}>{errors.street}</span>
        )}
      </div>
    </div>
  );
};

export default RealAddress;
