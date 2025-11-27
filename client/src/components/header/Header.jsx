import React from "react";
import style from "./header.module.scss";
import logo from "../../assets/logo.svg";
import { Link, useLocation } from "react-router-dom";
import business from "../../assets/icons/business.svg";
import signin from "../../assets/icons/signin.svg";
import { useNavigate } from "react-router-dom";

const Header = ({ setOpenMenu, openMenu }) => {
  const navigation = useNavigate();
  const location = useLocation();

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
              <img src={logo} alt="лого" />
            </Link>
          </div>

          <div className={style.header__buttons}>
            <button className={style.header__button_business}>
              <img src={business} alt="Бизнесу" />
              <p>Бизнесу</p>
            </button>

            <button
              className={style.header__button_signin}
              onClick={() => navigation("/account/loan_applications")}
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
