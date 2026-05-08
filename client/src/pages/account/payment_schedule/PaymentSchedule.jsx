import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import style from "./paymentschedule.module.scss";
import MobileLeftPanel from "../../../components/mobile_left_panel/MobileLeftPanel";

const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M9 12L4 7l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Angle = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

const formatMoney = (value) =>
  new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + " ₽";

const generatePayments = (year, currentMonth) => {
  const startMonth = year === 2026 ? 1 : 0;
  return Array.from({ length: 12 - startMonth }, (_, i) => {
    const monthIdx = startMonth + i;
    const isFifthMonth = monthIdx === 4;
    return {
      id: `${year}-${monthIdx}`,
      date: `24 ${MONTHS[monthIdx]}`,
      amount: isFifthMonth ? 100000 : 37453.45,
      residual: 1937453.45,
      principal: isFifthMonth ? 80000 : 30000,
      interest: isFifthMonth ? 20000 : 7453.45,
      isCurrent: year === 2026 && monthIdx === currentMonth,
    };
  });
};

const PaymentSchedule = ({ setOpenMenu, openMenu }) => {
  const navigate = useNavigate();
  const years = [2025, 2026, 2027, 2028, 2029];
  const [activeYear, setActiveYear] = useState(2026);
  const [openId, setOpenId] = useState(null);

  const payments = useMemo(() => generatePayments(activeYear, 8), [activeYear]);

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handlePayNow = (e) => {
    e.stopPropagation();
    navigate("/account/my-credits/repayment");
  };

  const handleYearChange = (year) => {
    setActiveYear(year);
    setOpenId(null);
  };

  return (
    <div className={style.page}>
      <div className="container">
        <div className={style.wrapper}>
          <MobileLeftPanel setOpenMenu={setOpenMenu} openMenu={openMenu} />

          <section className={style.main}>
            <button type="button" className={style.back} onClick={() => navigate(-1)}>
              <Chevron />
              <span>Назад</span>
            </button>

            <h1>График платежей</h1>

            <nav className={style.tabs} aria-label="Год">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  className={`${style.tab} ${activeYear === year ? style.tab_active : ""}`}
                  onClick={() => handleYearChange(year)}
                >
                  {year}
                </button>
              ))}
            </nav>

            <ul className={style.list}>
              {payments.map((p) => {
                const isOpen = openId === p.id;
                return (
                  <li
                    key={p.id}
                    className={`${style.item} ${isOpen ? style.item_open : ""} ${
                      p.isCurrent ? style.item_current : ""
                    }`}
                  >
                    <div
                      className={style.item__row}
                      onClick={() => handleToggle(p.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleToggle(p.id);
                        }
                      }}
                    >
                      <div className={style.item__left}>
                        <p className={style.item__date}>{p.date}</p>
                        <p className={style.item__amount}>{formatMoney(p.amount)}</p>
                        {p.isCurrent && (
                          <button
                            type="button"
                            className={style.item__cta}
                            onClick={handlePayNow}
                          >
                            Внести сейчас
                          </button>
                        )}
                      </div>

                      <div className={style.item__right}>
                        <p className={style.item__residual}>
                          Остаток: {formatMoney(p.residual)}
                        </p>
                        <span className={style.item__chevron}>
                          <Angle />
                        </span>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          className={style.item__details}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className={style.item__details__inner}>
                            <div className={style.item__detail}>
                              <p className={style.item__detail__label}>Основной долг</p>
                              <p className={style.item__detail__value}>
                                {formatMoney(p.principal)}
                              </p>
                            </div>
                            <div className={style.item__detail}>
                              <p className={style.item__detail__label}>Проценты</p>
                              <p className={style.item__detail__value}>
                                {formatMoney(p.interest)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PaymentSchedule;
