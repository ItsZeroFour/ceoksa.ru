import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import style from "./creditcard.module.scss";
import { ReactComponent as Calendar } from "../../assets/icons/profile/calendar.svg";
import { ReactComponent as Angle } from "../../assets/icons/angle.svg";
import { useNavigate } from "react-router-dom";
import EarlyRepaymentModal from "../early_repayment_modal/EarlyRepaymentModal";

const formatMoney = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return `${sign}${formatted} ₽`;
};

const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value)}%`;
};

const ACTIVE_DETAIL_ITEMS = [
  { key: "amount", label: "Сумма кредита", type: "value" },
  { key: "rate", label: "Процентная ставка", type: "percent" },
  { key: "earlyPayment", label: "Досрочное погашение", type: "link" },
  { key: "certificate", label: "Заказать справку", type: "link" },
  { key: "tariff", label: "Тариф", type: "link" },
];

const ARCHIVE_DETAIL_ITEMS = [
  { key: "amount", label: "Сумма кредита", type: "value" },
  { key: "rate", label: "Процентная ставка", type: "percent" },
  { key: "certificate", label: "Заказать справку", type: "link" },
  { key: "tariff", label: "Тариф", type: "link" },
];

const CreditCard = ({ credit, archived = false }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEarlyOpen, setIsEarlyOpen] = useState(false);

  const navigate = useNavigate();

  if (!credit) return null;

  const isOverdue = !archived && credit.status?.type === "overdue";
  const detailItems = archived ? ARCHIVE_DETAIL_ITEMS : ACTIVE_DETAIL_ITEMS;
  const details = credit.details ?? {};

  const handleEarlyPayment = () => setIsEarlyOpen(true);
  const handleCertificate = () => {
    navigate("/account/my-credits/certificates", {
      state: { creditId: credit.id },
    });
  };
  const handleTariff = () => {};
  const handleSchedule = () => {
    navigate("/account/my-credits/schedule", {
      state: { creditId: credit.id },
    });
  };
  const handlePayment = () => {
    navigate("/account/my-credits/repayment", {
      state: { creditId: credit.id },
    });
  };

  const linkHandlers = {
    earlyPayment: handleEarlyPayment,
    certificate: handleCertificate,
    tariff: handleTariff,
  };

  return (
    <article className={`${style.card} ${archived ? style.card_archived : ""}`}>
      {!archived && credit.status && (
        <div
          className={`${style.card__badge} ${
            isOverdue ? style.card__badge_overdue : style.card__badge_upcoming
          }`}
        >
          {credit.status.text}
        </div>
      )}

      <header className={style.card__header}>
        <div className={style.card__bank}>
          {credit.bank?.logo && (
            <div className={style.card__logo}>
              <img src={credit.bank.logo} alt={credit.bank?.name ?? ""} />
            </div>
          )}
          <div className={style.card__bank__text}>
            <p className={style.card__product}>
              {credit.productName}{" "}
              {credit.accountMask && (
                <span className={style.card__mask}>{credit.accountMask}</span>
              )}
            </p>
            <h3>{credit.bank?.name}</h3>
          </div>
        </div>
      </header>

      <div className={style.card__info}>
        {archived ? (
          <>
            <div className={style.card__pill}>
              <p className={style.card__pill__label}>Сумма договора</p>
              <p className={style.card__pill__value}>
                {formatMoney(credit.contractAmount)}
              </p>
            </div>
            <div className={style.card__pill}>
              <p className={style.card__pill__label}>Дата закрытия кредита</p>
              <p className={style.card__pill__value}>
                {credit.closeDate ?? "—"}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className={style.card__pill}>
              <p className={style.card__pill__label}>Остаток долга</p>
              <p className={style.card__pill__value}>
                {formatMoney(credit.balance)}
              </p>
            </div>
            <div
              className={`${style.card__pill} ${
                isOverdue ? style.card__pill_overdue : ""
              }`}
            >
              <p className={style.card__pill__label}>
                Ближайший платёж
                {credit.nextPayment?.date
                  ? ` — ${credit.nextPayment.date}`
                  : ""}
              </p>
              <p className={style.card__pill__value}>
                {formatMoney(credit.nextPayment?.amount)}
              </p>
            </div>
          </>
        )}
      </div>

      {!archived && (
        <div className={style.card__actions}>
          <button
            type="button"
            className={style.card__btn_secondary}
            onClick={handleSchedule}
          >
            <Calendar />
            График платежей
          </button>
          <button
            type="button"
            className={style.card__btn_primary}
            onClick={handlePayment}
          >
            Внести на погашение
          </button>
        </div>
      )}

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
                          {formatMoney(details[item.key]).replace("-", "")}
                        </span>
                      </li>
                    );
                  }
                  if (item.type === "percent") {
                    return (
                      <li key={item.key}>
                        <span>{item.label}</span>
                        <span className={style.card__details__value}>
                          {formatPercent(details[item.key])}
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

      <EarlyRepaymentModal
        isOpen={isEarlyOpen}
        onClose={() => setIsEarlyOpen(false)}
        credit={credit}
      />
    </article>
  );
};

export default CreditCard;
