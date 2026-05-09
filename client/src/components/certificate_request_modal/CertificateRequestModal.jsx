import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import style from "./certificaterequestmodal.module.scss";

const PencilIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity="0.3">
      <path
        d="M10.7496 5.71183L14.2851 9.24739L6.03553 17.497H2.5V13.9614L10.7496 5.71183ZM11.9281 4.53333L13.6958 2.76556C14.0213 2.44013 14.5489 2.44013 14.8743 2.76556L17.2314 5.12258C17.5568 5.44802 17.5568 5.97566 17.2314 6.30109L15.4636 8.06886L11.9281 4.53333Z"
        fill="currentColor"
      />
    </g>
  </svg>
);

const CertificateRequestModal = ({ certificate, email, onClose }) => {
  const isOpen = Boolean(certificate);
  const [value, setValue] = useState(email ?? "");

  useEffect(() => {
    if (!isOpen) return;

    setValue(email ?? "");
    document.body.style.overflow = "hidden";
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, email, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = () => {
    // TODO: send certificate request to API
    onClose();
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
              <h3>Заказ справок, выписок</h3>
              <button
                type="button"
                className={style.close}
                onClick={onClose}
                aria-label="Закрыть"
              />
            </header>

            <p className={style.description}>{certificate?.description}</p>

            <div className={style.field}>
              <label htmlFor="cert-email">Электронный адрес получателя</label>
              <div className={style.field__row}>
                <input
                  id="cert-email"
                  type="email"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  autoComplete="email"
                />
                <span className={style.field__icon}>
                  <PencilIcon />
                </span>
              </div>
            </div>

            <button type="button" className={style.cta} onClick={handleSubmit}>
              Отправить
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CertificateRequestModal;
