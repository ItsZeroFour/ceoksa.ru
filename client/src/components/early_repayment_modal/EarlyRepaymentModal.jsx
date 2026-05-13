import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import style from "./earlyrepaymentmodal.module.scss";
import InfoModal from "../info_modal/InfoModal";

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M5 12l5-5-5-5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PartialIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 12a8 8 0 1 1-2.34-5.66"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M20 4v3.5h-3.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M8 12.5l2.5 2.5L16 9.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const formatMoney = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return (
    new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " ₽"
  );
};

const EarlyRepaymentModal = ({ isOpen, onClose, credit }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handlePartial = () => {
    setIsInfoOpen(true);
  };

  const handleFullClose = () => {
    onClose();
    navigate("/account/my-credits/full-repayment", {
      state: { creditId: credit?.id, balance: credit?.balance },
    });
  };

  const handleInfoClose = () => {
    setIsInfoOpen(false);
    onClose();
    navigate("/account/my-credits/partial-repayment", {
      state: { creditId: credit?.id },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={style.overlay}
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className={style.modal}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <header className={style.header}>
              <h3>Досрочное погашение</h3>
              <button
                type="button"
                className={style.close}
                onClick={onClose}
                aria-label="Закрыть"
              />
            </header>

            <div className={style.bank}>
              {credit?.bank?.logo && (
                <div className={style.bank__logo}>
                  <img src={credit.bank.logo} alt={credit.bank?.name ?? ""} />
                </div>
              )}
              <div className={style.bank__text}>
                <p className={style.bank__product}>
                  {credit?.productName}{" "}
                  {credit?.accountMask && (
                    <span className={style.bank__mask}>
                      {credit.accountMask}
                    </span>
                  )}
                </p>
                <p className={style.bank__name}>{credit?.bank?.name}</p>
              </div>
            </div>

            <ul className={style.options}>
              <li className={style.option} onClick={handlePartial}>
                <div className={style.option__icon}>
                  <PartialIcon />
                </div>
                <div className={style.option__text}>
                  <p className={style.option__title}>Погасить частично</p>
                  <p className={style.option__sub}>Можно внести любую сумму</p>
                </div>
                <span className={style.option__chevron}>
                  <ChevronRight />
                </span>
              </li>

              <li className={style.option} onClick={handleFullClose}>
                <div className={style.option__icon}>
                  <CheckIcon />
                </div>
                <div className={style.option__text}>
                  <p className={style.option__title}>Закрыть досрочно</p>
                  <p className={style.option__sub}>
                    {formatMoney(credit?.balance)}
                  </p>
                </div>
                <span className={style.option__chevron}>
                  <ChevronRight />
                </span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      )}

      <InfoModal
        isOpen={isInfoOpen}
        onClose={handleInfoClose}
        title="Как работает частичное погашение"
      >
        <p>
          В первую очередь будет погашен ближайший платёж. Оставшаяся сумма
          пойдёт на уменьшение основного долга. Вы сможете снизить ежемесячный
          платёж или сократить срок кредита. Введите сумму — и мы покажем, как
          изменятся условия.
        </p>
      </InfoModal>
    </AnimatePresence>
  );
};

export default EarlyRepaymentModal;
