import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import style from "./bankselectormodal.module.scss";
import vtb from "../../assets/icons/vtb.png";
import tbank from "../../assets/icons/tbank.png";
import sovcombank from "../../assets/icons/sovcombank.png";
import sber from "../../assets/icons/sber.svg";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
    <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const ALL_BANKS = [
  // { id: "alfa", name: "Альфа Банк", color: "#EF3124", initial: "А", textColor: "#fff" },
  // { id: "raif", name: "Райффайзенбанк", color: "#FEDD00", initial: "X", textColor: "#000" },
  { id: "vtb", name: "ВТБ", logo: vtb },
  { id: "tbank", name: "Т-Банк", logo: tbank },
  { id: "sovcom", name: "Совкомбанк", logo: sovcombank },
  { id: "sber", name: "Сбербанк", logo: sber },
  // { id: "gazprom", name: "Газпромбанк", color: "#0079C1", initial: "Г", textColor: "#fff" },
  // { id: "open", name: "Банк Открытие", color: "#00A9E0", initial: "О", textColor: "#fff" },
  // { id: "psb", name: "Промсвязьбанк", color: "#F58220", initial: "П", textColor: "#fff" },
  // { id: "rsb", name: "Росбанк", color: "#CE0E2D", initial: "Р", textColor: "#fff" },
];

const BankLogo = ({ bank }) => {
  if (bank.logo) {
    return (
      <div className={style.bank__logo}>
        <img src={bank.logo} alt={bank.name} />
      </div>
    );
  }

  return (
    <div
      className={style.bank__logo_placeholder}
      style={{ background: bank.color, color: bank.textColor }}
    >
      {bank.initial}
    </div>
  );
};

const BankSelectorModal = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState("");

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

  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_BANKS;
    return ALL_BANKS.filter((bank) => bank.name.toLowerCase().includes(q));
  }, [query]);

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
              <h3>Выберите банк</h3>
              <button
                type="button"
                className={style.close}
                onClick={onClose}
                aria-label="Закрыть"
              />
            </header>

            <div className={style.search}>
              <div className={style.search__icon}>
                <SearchIcon />
              </div>
              <div className={style.search__field}>
                <label htmlFor="bank-search">Название банка</label>
                <input
                  id="bank-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Введите название банка"
                  autoComplete="off"
                />
              </div>
            </div>

            <ul className={style.list}>
              {filtered.length === 0 ? (
                <li className={style.empty}>Банк не найден</li>
              ) : (
                filtered.map((bank) => (
                  <li
                    key={bank.id}
                    className={style.bank}
                    onClick={() => onSelect?.(bank)}
                  >
                    <BankLogo bank={bank} />
                    <span className={style.bank__name}>{bank.name}</span>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BankSelectorModal;
