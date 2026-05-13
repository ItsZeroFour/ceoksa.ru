import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import style from "./paymentconfirmmodal.module.scss";

const PaymentConfirmModal = ({ isOpen, onClose }) => {
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
              <h3>Подтвердите оплату в банке</h3>
              <button
                type="button"
                className={style.close}
                onClick={onClose}
                aria-label="Закрыть"
              />
            </header>

            <div className={style.body}>
              <p>
                Мы отправили запрос на перевод через СБП. Подтвердите платёж в
                приложении вашего банка.
              </p>
              <p>
                После подтверждения деньги поступят в течение нескольких секунд.
              </p>
            </div>

            <button type="button" className={style.cta} onClick={onClose}>
              Понятно
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentConfirmModal;
