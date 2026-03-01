import React, { useState } from "react";
import style from "./top.module.scss";
import camera from "../../../../assets/icons/account/camera.svg";
import gosuslugi from "../../../../assets/gosuslugi.png";
import { ReactComponent as Load } from "../../../../assets/icons/account/load.svg";
import { motion } from "framer-motion";
import { ReactComponent as Phone } from "../../../../assets/icons/profile/phone.svg";
import { ReactComponent as Mail } from "../../../../assets/icons/profile/mail.svg";
import { ReactComponent as Calendar } from "../../../../assets/icons/profile/calendar.svg";
import { ReactComponent as Man } from "../../../../assets/icons/profile/man.svg";
import { ReactComponent as Edit } from "../../../../assets/icons/account/edit.svg";
import { useValidation } from "../../../../hooks/useValidation";
import { useScreenWidth } from "../../../../hooks/useScreenWidth";
import { useSelector } from "react-redux";

const Top = ({ user }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log(user);

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

  const getInitials = () => {
    if (!user.fullName) return "ФИ";
    const names = user.fullName.trim().split(" ");
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return names[0][0];
  };

  const formatFullName = (str) =>
    str
      ? str
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ")
      : "";

  const formatCapitalize = (str) =>
    str ? str.replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  const formatGender = (val) => {
    if (!val) return "";
    const v = val.trim().toLowerCase();
    if (v === "муж" || v === "м" || v === "male") return "Мужской";
    if (v === "жен" || v === "ж" || v === "female") return "Женский";
    return formatCapitalize(val);
  };

  return (
    <div className={style.top}>
      <div className={style.top__wrapper}>
        <h1>Профиль</h1>

        {user ? (
          <>
            <div className={style.top__main}>
              <div className={style.top__main__name}>
                <div className={style.top__main__name__avatar}>
                  <div className={style.top__main__name__avatar__img}>
                    {user.profilePhoto ? (
                      <img
                        src={`${process.env.REACT_APP_SERVERF_API}${user.profilePhoto}`}
                        alt="Фото профиля"
                      />
                    ) : (
                      <p>{getInitials()}</p>
                    )}
                  </div>

                  {/* <button>
                    <img src={camera} alt="Загрузить фото" />
                  </button> */}
                </div>

                <div className={style.top__main__name__main}>
                  <p>
                    {formatFullName(user?.fullName || "Фамилия Имя Отчество")}
                  </p>

                  {/* <div className={style.top__main__name__main__data}> */}
                  {/* <div className={style.top__main__name__main__data__text}>
                  <img src={gosuslugi} alt="госуслуги" />
                  <p>Данные загружены 12 ноября 2025</p>
                </div> */}
                  {/* <motion.button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  whileTap={{ scale: 0.95 }}
                  className={isRefreshing ? style.refreshingButton : ""}
                >
                  <motion.div
                    animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                    transition={{
                      duration: 1,
                      repeat: isRefreshing ? Infinity : 0,
                      ease: "linear",
                    }}
                  >
                    <Load />
                  </motion.div>

                  {isRefreshing ? "Обновление..." : "Обновить данные"}
                </motion.button> */}
                  {/* </div> */}
                </div>
              </div>

              <ul>
                <li>
                  <div className={style.top__item__icon}>
                    <Phone />
                  </div>

                  <div className={style.top__item__text}>
                    <p>Номер телефона</p>
                    <p>
                      +
                      {user.phone.replace(
                        /^7(\d{3})(\d{3})(\d{2})(\d{2})$/,
                        "7 ($1) $2-$3-$4"
                      )}
                    </p>
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
                    {/* <input
                      type="email"
                      id="mail"
                      placeholder={mailPlaceholder}
                      value={user.email}
                      {...getFieldProps("mail")}
                      readOnly={true}
                    /> */}
                    <p>{user.email || "example@mail.ru"}</p>
                    {/* <Edit /> */}
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
                    <p>{user?.passport?.birth || "00.00.000"}</p>
                  </div>
                </li>

                <li>
                  <div className={style.top__item__icon}>
                    <Man />
                  </div>

                  <div className={style.top__item__text}>
                    <p>Пол</p>
                    <p>{formatGender(user.passport.gender || "")}</p>
                  </div>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <p>Загрузка профиля...</p>
        )}
      </div>
    </div>
  );
};

export default Top;
