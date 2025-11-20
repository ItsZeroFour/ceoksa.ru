import React from "react";
import style from "./header.module.scss";
import logo from "../../assets/logo.svg";
import { Link } from "react-router-dom";
import business from "../../assets/icons/business.svg";
import signin from "../../assets/icons/signin.svg";

const Header = () => {
  return (
    <header className={style.header}>
      <div className="container">
        <div className={style.header__wrapper}>
          <div className={style.header__logo}>
            <Link to="/">
              <img src={logo} alt="лого" />
            </Link>
          </div>

          <div className={style.header__buttons}>
            <button className={style.header__button_business}>
              <img src={business} alt="Бизнесу" />
              Бизнесу
            </button>

            <button className={style.header__button_signin}>
              <img src={signin} alt="Войти" />
              Войти
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
