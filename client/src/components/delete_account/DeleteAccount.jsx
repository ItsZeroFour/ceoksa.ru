import React from "react";
import style from "./deleteaccount.module.scss";
import logo from "../../assets/logo.svg";
import { Link } from "react-router-dom";

const DeleteAccount = () => {
  return (
    <div className={style.delete_account}>
      <div className={style.delete_account__wrapper}>
        <button
          className={style.delete_account__close}
          onClick={() => window.location.reload()}
        />

        <Link to="/">
          <img src={logo} alt="logo" />
        </Link>

        <p>Ваш аккаунт на ОКСА удален</p>
      </div>
    </div>
  );
};

export default DeleteAccount;
