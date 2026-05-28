import React from "react";
import { useNavigate } from "react-router-dom";
import style from "./notificationbell.module.scss";
import { ReactComponent as BellIcon } from "../../assets/icons/notification.svg";

const formatCount = (n) => {
  if (!n || n <= 0) return null;
  if (n > 99) return "99+";
  return String(n);
};

const NotificationBell = ({ count = 0 }) => {
  const navigate = useNavigate();
  const badge = formatCount(count);

  return (
    <button
      type="button"
      className={style.bell}
      onClick={() => navigate("/account/notifications")}
      aria-label="Уведомления"
    >
      <BellIcon className={style.bell__icon} />
      {badge && <span className={style.bell__badge}>{badge}</span>}
    </button>
  );
};

export default NotificationBell;
