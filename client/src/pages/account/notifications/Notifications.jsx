import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./notifications.module.scss";
import MobileLeftPanel from "../../../components/mobile_left_panel/MobileLeftPanel";
import { NOTIFICATIONS } from "./notificationsMock";

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

const TABS = [
  { id: "banks", label: "Банки" },
  { id: "oksa", label: "ОКСА" },
];

const Notifications = ({ setOpenMenu, openMenu }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("banks");

  const items = useMemo(
    () => NOTIFICATIONS.filter((n) => n.source === activeTab),
    [activeTab]
  );

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

            <h1>Уведомления</h1>

            <nav className={style.tabs} aria-label="Источник уведомлений">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`${style.tab} ${
                    activeTab === tab.id ? style.tab_active : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {items.length === 0 ? (
              <section className={style.empty}>
                <h2>У вас нет уведомлений</h2>
                <p>
                  Здесь будут отображаться ваши уведомления от{" "}
                  {activeTab === "banks" ? "Банков" : "ОКСА"}
                </p>
              </section>
            ) : (
              <ul className={style.list}>
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={style.item}
                    onClick={() =>
                      navigate(`/account/notifications/${n.id}`, {
                        state: { notification: n },
                      })
                    }
                  >
                    <div className={style.item__logo}>
                      {n.bank?.logo && (
                        <img src={n.bank.logo} alt={n.bank.name} />
                      )}
                      {n.unread && <span className={style.item__dot} />}
                    </div>

                    <div className={style.item__body}>
                      <h3
                        className={`${style.item__title} ${
                          !n.unread && style.item__title__unread
                        }`}
                      >
                        {n.title}
                      </h3>
                      <p className={style.item__preview}>
                        {n.preview.split("\n").map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < n.preview.split("\n").length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </p>
                      <p className={style.item__time}>
                        {n.date} · {n.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
