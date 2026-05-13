import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import style from "./notificationdetail.module.scss";
import MobileLeftPanel from "../../../components/mobile_left_panel/MobileLeftPanel";
import { findNotificationById } from "../notifications/notificationsMock";

const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M9 12L4 7l5-5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NotificationDetail = ({ setOpenMenu, openMenu }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const notification = location.state?.notification ?? findNotificationById(id);

  return (
    <div className={style.page}>
      <div className="container">
        <div className={style.wrapper}>
          <MobileLeftPanel setOpenMenu={setOpenMenu} openMenu={openMenu} />

          <section className={style.main}>
            <button
              type="button"
              className={style.back}
              onClick={() => navigate(-1)}
            >
              <Chevron />
              <span>Назад</span>
            </button>

            {!notification ? (
              <section className={style.empty}>
                <h2>Уведомление не найдено</h2>
              </section>
            ) : (
              <section className={style.card}>
                <div className={style.card__wrapper}>
                  <header className={style.card__header}>
                    {notification.bank?.logo && (
                      <div className={style.card__logo}>
                        <img
                          src={notification.bank.logo}
                          alt={notification.bank.name}
                        />
                      </div>
                    )}
                    <div className={style.card__head__text}>
                      <h1 className={style.card__title}>
                        {notification.title}
                      </h1>
                      <p className={style.card__time}>
                        {notification.date} · {notification.time}
                      </p>
                    </div>
                  </header>

                  <div className={style.card__body}>
                    {notification.body
                      .split("\n")
                      .filter(Boolean)
                      .map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                  </div>
                </div>
              </section>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;
