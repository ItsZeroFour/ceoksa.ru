import React from "react";
import style from "./deleteaccount.module.scss";
import logo from "../../assets/logo.svg";
import logoDark from "../../assets/logo-dark.svg";
import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

const DeleteAccount = () => {
  const { theme } = useTheme();

  return (
    <div className={style.delete_account}>
      <div className={style.delete_account__wrapper}>
        <button
          className={style.delete_account__close}
          onClick={() => window.location.reload()}
        />

        <Link to="/">
          <img src={theme === "light" ? logo : logoDark} alt="лого" />
        </Link>

        <p>Ваш аккаунт на ОКСА удален</p>
      </div>
    </div>
  );
};

export default DeleteAccount;
