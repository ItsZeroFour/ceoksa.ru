import React from "react";
import style from "./header.module.scss";
import logo from "../../assets/logo.svg";
import logoDark from "../../assets/logo-dark.svg";
import { Link, useLocation } from "react-router-dom";
import { ReactComponent as Business } from "../../assets/icons/business.svg";
import signin from "../../assets/icons/signin.svg";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

const Header = ({ setOpenMenu, openMenu, setOpenAuthMenu }) => {
  const navigation = useNavigate();
  const location = useLocation();

  const { theme } = useTheme();

  return (
    <header className={style.header}>
      <div className="container">
        <div className={style.header__wrapper}>
          <div className={style.header__logo}>
            {location.pathname !== "/" && (
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
            <button className={style.header__button_business}>
              <Business />
              <p>Бизнесу</p>
            </button>

            <button
              className={style.header__button_signin}
              // onClick={() => navigation("/account/loan_applications")}
              onClick={() => setOpenAuthMenu(true)}
            >
              <img src={signin} alt="Войти" />
              <p>Войти</p>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
