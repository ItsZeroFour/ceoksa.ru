import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import style from "./creditcard.module.scss";
import { ReactComponent as Angle } from "../../assets/icons/angle.svg";

const formatMoney = (value) =>
  `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value))} ₽`;

const formatPercent = (value) =>
  `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value)}%`;

const detailItems = [
  { key: "amount", label: "Сумма кредита", type: "value" },
  { key: "rate", label: "Процентная ставка", type: "percent" },
  { key: "certificate", label: "Заказать справку", type: "link" },
  { key: "tariff", label: "Тариф", type: "link" },
];

const ArchiveCreditCard = ({ credit }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleCertificate = () => {};
  const handleTariff = () => {};

  const linkHandlers = {
    certificate: handleCertificate,
    tariff: handleTariff,
  };

  return (
    <article className={style.card}>
      <header className={style.card__header}>
        <div className={style.card__bank}>
          <div className={style.card__logo}>
            <img src={credit.bank.logo} alt={credit.bank.name} />
          </div>
          <div className={style.card__bank__text}>
            <p className={style.card__product}>
              {credit.productName}{" "}
              <span className={style.card__mask}>{credit.accountMask}</span>
            </p>
            <h3>{credit.bank.name}</h3>
          </div>
        </div>
      </header>

      <div className={style.card__info}>
        <div className={style.card__pill}>
          <p className={style.card__pill__label}>Сумма договора</p>
          <p className={style.card__pill__value}>
            {formatMoney(credit.contractSum)}
          </p>
        </div>

        <div className={style.card__pill}>
          <p className={style.card__pill__label}>Дата закрытия кредита</p>
          <p className={style.card__pill__value}>{credit.closeDate}</p>
        </div>
      </div>

      <div
        className={`${style.card__details} ${
          isDetailsOpen ? style.card__details_open : ""
        }`}
      >
        <button
          type="button"
          className={style.card__details__toggle}
          onClick={() => setIsDetailsOpen((prev) => !prev)}
          aria-expanded={isDetailsOpen}
        >
          <span>Детали кредита</span>
          <Angle />
        </button>

        <AnimatePresence initial={false}>
          {isDetailsOpen && (
            <motion.div
              className={style.card__details__body}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <ul className={style.card__details__list}>
                {detailItems.map((item) => {
                  if (item.type === "value") {
                    return (
                      <li key={item.key}>
                        <span>{item.label}</span>
                        <span className={style.card__details__value}>
                          {formatMoney(credit.details[item.key])}
                        </span>
                      </li>
                    );
                  }
                  if (item.type === "percent") {
                    return (
                      <li key={item.key}>
                        <span>{item.label}</span>
                        <span className={style.card__details__value}>
                          {formatPercent(credit.details[item.key])}
                        </span>
                      </li>
                    );
                  }
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        className={style.card__details__link}
                        onClick={linkHandlers[item.key]}
                      >
                        <span>{item.label}</span>
                        <Angle className={style.card__details__chevron} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
};

export default ArchiveCreditCard;
