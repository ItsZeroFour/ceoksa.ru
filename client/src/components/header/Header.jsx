import React from "react";
import style from "./header.module.scss";
import logo from "../../assets/logo.svg";
import logoDark from "../../assets/logo-dark.svg";
import { Link, useLocation } from "react-router-dom";
import { ReactComponent as Business } from "../../assets/icons/business.svg";
import signin from "../../assets/icons/signin.svg";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

const Header = ({
  setOpenMenu,
  openMenu,
  setOpenAuthMenu,
  userData,
  userStatus,
}) => {
  const navigation = useNavigate();
  const location = useLocation();

  const { theme } = useTheme();

  const getInitials = () => {
    if (!userData.fullName) return "ФИ";
    const names = userData.fullName.trim().split(" ");
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return names[0][0];
  };

  return (
    <header className={style.header}>
      <div className="container">
        <div className={style.header__wrapper}>
          <div className={style.header__logo}>
            {location.pathname !== "/" &&
              location.pathname !== "/privacy-policy" &&
              location.pathname !== "/polzovatelskoe-soglashenie" && (
                <button
                  className={style.header__menu}
                  onClick={() => setOpenMenu(!openMenu)}
                ></button>
              )}

            <Link to="/">
              <img src={theme === "light" ? logo : logoDark} alt="лого" />
            </Link>
          </div>

          <div className={style.header__buttons}>
            {/* <button className={style.header__button_business}>
              <Business />
              <p>Бизнесу</p>
            </button> */}

            {userStatus === "succeeded" && userData ? (
              <Link
                to="/account/loan_applications"
                className={style.header__profile}
              >
                {userData.profilePhoto ? (
                  <div className={style.header__profile__avatar}>
                    <img
                      src={`${process.env.REACT_APP_SERVERF_API}${userData.profilePhoto}`}
                      alt="Фото профиля"
                    />
                  </div>
                ) : (
                  <div className={style.header__profile__name__avatar}>
                    <p>{getInitials()}</p>
                  </div>
                )}

                {/* <div className={style.header__profile__name}>
                  <h3>
                    {userData?.fullName
                      ? (() => {
                          const firstName =
                            userData.fullName.split(" ")[1] ||
                            userData.fullName;

                          return firstName.length > 20
                            ? `${firstName.slice(0, 20)}...`
                            : firstName;
                        })()
                      : "Имя"}
                  </h3>
                </div> */}
              </Link>
            ) : (
              <button
                className={style.header__button_signin}
                // onClick={() => navigation("/account/loan_applications")}
                onClick={() => setOpenAuthMenu(true)}
              >
                <img src={signin} alt="Войти" />
                <p>Войти</p>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
