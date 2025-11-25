import React from "react";
import style from "./notification.module.scss";
import info from "../../assets/icons/info.svg";

const Notification = ({ text }) => {
  return (
    <div className={style.notification}>
      <img src={info} alt="info" />
      <p>{text}</p>
    </div>
  );
};

export default Notification;
