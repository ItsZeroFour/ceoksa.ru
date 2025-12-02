import React from "react";
import style from "./notification.module.scss";
import { ReactComponent as Info } from "../../assets/icons/info.svg";

const Notification = ({ text }) => {
  return (
    <div className={style.notification}>
      <Info />
      <p>{text}</p>
    </div>
  );
};

export default Notification;
