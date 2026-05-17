import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import style from "./earlyrepaymentmodal.module.scss";

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
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.0834 1.87891L10.0835 4.64861C6.97389 5.09342 4.5835 7.7677 4.5835 11.0003C4.5835 14.5441 7.45634 17.417 11.0002 17.417C12.4414 17.417 13.7718 16.9418 14.843 16.1395L16.8017 18.0979C15.2214 19.3911 13.2014 20.167 11.0002 20.167C5.93755 20.167 1.8335 16.0629 1.8335 11.0003C1.8335 6.2471 5.45123 2.33886 10.0834 1.87891ZM20.1215 11.9171C19.9385 13.7605 19.2094 15.4432 18.0982 16.8013L16.1394 14.8432C16.7684 14.0032 17.1964 13.004 17.3518 11.917L20.1215 11.9171ZM11.9178 1.879C16.2481 2.30941 19.6915 5.75321 20.1215 10.0835L17.3518 10.0835C16.9498 7.27362 14.7274 5.05107 11.9177 4.64875L11.9178 1.879Z"
      fill="currentColor"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.0002 20.1673C16.0627 20.1673 20.1668 16.0632 20.1668 11.0007C20.1668 5.93804 16.0627 1.83398 11.0002 1.83398C5.93755 1.83398 1.8335 5.93804 1.8335 11.0007C1.8335 16.0632 5.93755 20.1673 11.0002 20.1673ZM16.0025 8.66967L10.0835 14.5887L6.22698 10.7322L7.52335 9.43581L10.0835 11.996L14.7062 7.3733L16.0025 8.66967Z"
      fill="currentColor"
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
    onClose();
    navigate("/account/my-credits/partial-repayment", {
      state: { creditId: credit?.id },
    });
  };

  const handleFullClose = () => {
    onClose();
    navigate("/account/my-credits/full-repayment", {
      state: { creditId: credit?.id, balance: credit?.balance },
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
    </AnimatePresence>
  );
};

export default EarlyRepaymentModal;
