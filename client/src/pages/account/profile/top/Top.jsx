import React, { useState } from "react";
import style from "./top.module.scss";
import camera from "../../../../assets/icons/account/camera.svg";
import gosuslugi from "../../../../assets/gosuslugi.png";
import load from "../../../../assets/icons/account/load.svg";
import { motion } from "framer-motion";
import { ReactComponent as Phone } from "../../../../assets/icons/profile/phone.svg";
import { ReactComponent as Mail } from "../../../../assets/icons/profile/mail.svg";
import { ReactComponent as Calendar } from "../../../../assets/icons/profile/calendar.svg";
import { ReactComponent as Man } from "../../../../assets/icons/profile/man.svg";
import { ReactComponent as Edit } from "../../../../assets/icons/account/edit.svg";
import { useValidation } from "../../../../hooks/useValidation";
import { useScreenWidth } from "../../../../hooks/useScreenWidth";

const Top = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const { getFieldProps, hasError, errors } = useValidation(
    { mail: "" },
    {
      mail: [
        (v) =>
          v && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v)
            ? "Некорректный email"
            : "",
      ],
    }
  );

  const screenWidth = useScreenWidth();
  const mailPlaceholder =
    screenWidth < 780
      ? "Укажите эл. почту"
      : "Необходимо указать электронную почту";

  return (
    <div className={style.top}>
      <div className={style.top__wrapper}>
        <h1>Профиль</h1>

        <div className={style.top__main}>
          <div className={style.top__main__name}>
            <div className={style.top__main__name__avatar}>
              <div className={style.top__main__name__avatar__img}>
                <p>ФИ</p>
              </div>

              <button>
                <img src={camera} alt="Загрузить фото" />
              </button>
            </div>

            <div className={style.top__main__name__main}>
              <p>Фамилия Имя Отчество</p>

              <div className={style.top__main__name__main__data}>
                <div className={style.top__main__name__main__data__text}>
                  <img src={gosuslugi} alt="госуслуги" />
                  <p>Данные загружены 12 ноября 2025</p>
                </div>
                <motion.button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  whileTap={{ scale: 0.95 }}
                  className={isRefreshing ? style.refreshingButton : ""}
                >
                  <motion.img
                    src={load}
                    alt="Обновить данные"
                    animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                    transition={{
                      duration: 1,
                      repeat: isRefreshing ? Infinity : 0,
                      ease: "linear",
                    }}
                  />
                  {isRefreshing ? "Обновление..." : "Обновить данные"}
                </motion.button>
              </div>
            </div>
          </div>

          <ul>
            <li>
              <div className={style.top__item__icon}>
                <Phone />
              </div>

              <div className={style.top__item__text}>
                <p>Номер телефона</p>
                <p>+7 987 654-32-10</p>
              </div>
            </li>

            <li className={hasError("mail") ? `${style.error}` : ""}>
              <div className={style.top__item__icon}>
                <Mail />
              </div>

              <div
                className={
                  hasError("mail")
                    ? `${style.top__form__item} ${style.error}`
                    : style.top__form__item
                }
              >
                <label htmlFor="mail">Электронная почта</label>
                <input
                  type="email"
                  id="mail"
                  placeholder={mailPlaceholder}
                  {...getFieldProps("mail")}
                />
                <Edit />
                {hasError("mail") && (
                  <span className={style.error_text}>{errors.mail}</span>
                )}
              </div>
            </li>

            <li>
              <div className={style.top__item__icon}>
                <Calendar />
              </div>

              <div className={style.top__item__text}>
                <p>Дата рождения</p>
                <p>17 октября 1998</p>
              </div>
            </li>

            <li>
              <div className={style.top__item__icon}>
                <Man />
              </div>

              <div className={style.top__item__text}>
                <p>Пол</p>
                <p>Женский</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Top;
