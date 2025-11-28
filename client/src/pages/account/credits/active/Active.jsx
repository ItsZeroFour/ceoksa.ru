import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import style from "./active.module.scss";
import { ReactComponent as FilterIcon } from "../../../../assets/icons/account/filter.svg";
import { ReactComponent as Angle } from "../../../../assets/icons/angle.svg";
import { ReactComponent as Info } from "../../../../assets/icons/info-2.svg";
import tbank from "../../../../assets/icons/tbank.png";
import vtb from "../../../../assets/icons/vtb.png";
import sber from "../../../../assets/icons/sber.svg";
import { filterVariants } from "../../../../animations/account-active";
import { Badge } from "../../../../components/badge/Badge";

const Active = () => {
  const [openFilter, setOpenFilter] = useState(false);
  const [sortOption, setSortOption] = useState(null);

  const itemsData = useMemo(
    () => [
      {
        id: 1,
        badges: [
          { text: "Одобрено", style: {} },
          { text: "Лучшее предложение", style: { background: "#e11d12" } },
        ],
        bankImage: tbank,
        bankName: "Т-Банк",
        productName: "На любые цели",
        characteristics: [
          { label: "Годовая ставка", value: 22.9, display: "22,9%" },
          { label: "Сумма кредита", value: 2000000, display: "2 000 000 ₽" },
          { label: "Платёж в месяц", value: 87373.34, display: "87 373,34 ₽" },
          { label: "Срок кредита", value: 5, display: "5 лет" },
        ],
      },
      {
        id: 2,
        badges: [{ text: "Одобрено", style: {} }],
        bankImage: vtb,
        bankName: "ВТБ",
        productName: "На любые цели",
        characteristics: [
          { label: "Годовая ставка", value: 22.9, display: "22,9%" },
          { label: "Сумма кредита", value: 4000000, display: "4 000 000 ₽" },
          { label: "Платёж в месяц", value: 67145.15, display: "67 145,15 ₽" },
          { label: "Срок кредита", value: 5, display: "5 лет" },
        ],
      },
      {
        id: 3,
        badges: [
          { text: "Лучшее предложение", style: { background: "#e11d12" } },
        ],
        bankImage: sber,
        bankName: "Сбербанк",
        productName: "На любые цели",
        characteristics: [
          { label: "Годовая ставка", value: 21.9, display: "21,9%" },
          { label: "Сумма кредита", value: 3000000, display: "3 000 000 ₽" },
          { label: "Платёж в месяц", value: 97243.34, display: "97 243,34 ₽" },
          { label: "Срок кредита", value: 5, display: "5 лет" },
        ],
      },
    ],
    []
  );

  const [sortedItems, setSortedItems] = useState(itemsData);

  const sortByRate = () => {
    const sorted = [...itemsData].sort(
      (a, b) => a.characteristics[0].value - b.characteristics[0].value
    );
    setSortedItems(sorted);
    setSortOption("rate");
    setOpenFilter(false);
  };

  const sortByPayment = () => {
    const sorted = [...itemsData].sort(
      (a, b) => a.characteristics[2].value - b.characteristics[2].value
    );
    setSortedItems(sorted);
    setSortOption("payment");
    setOpenFilter(false);
  };

  const resetSort = () => {
    setSortedItems(itemsData);
    setSortOption(null);
    setOpenFilter(false);
  };

  return (
    <motion.div
      className={style.active}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className={style.active__wrapper}>
        <motion.div
          className={style.active__top}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className={style.active__top__text}>
            <h2>Персональные предложения</h2>
            <p>Заявка №12-509 от 12.11.2025</p>
          </div>

          <div className={style.active__top__filter}>
            <motion.div
              className={`${style.active__top__filer__main} ${
                sortOption ? style.active__sorted : ""
              }`}
              onClick={() => setOpenFilter(!openFilter)}
              whileTap={{ scale: 0.98 }}
            >
              <div className={style.active__top__filer__main__type}>
                <FilterIcon />
                <p>
                  {sortOption === "rate"
                    ? "По ставке"
                    : sortOption === "payment"
                    ? "По платежу"
                    : "Сортировка"}
                </p>
              </div>

              <motion.div
                className={style.active__filter__icon}
                animate={{ rotate: openFilter ? 180 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <Angle />
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {openFilter && (
                <motion.ul
                  className={style.active__filter_dropdown}
                  variants={filterVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  style={{ overflow: "hidden" }}
                >
                  <motion.li
                    // whileHover={{ backgroundColor: "#f5f5f5" }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <button
                      type="button"
                      onClick={sortByRate}
                      className={
                        sortOption === "rate"
                          ? style.active__filter_selected
                          : ""
                      }
                    >
                      По ставке (от меньшей к большей)
                    </button>
                  </motion.li>
                  <motion.li
                    // whileHover={{ backgroundColor: "#f5f5f5" }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <button
                      type="button"
                      onClick={sortByPayment}
                      className={
                        sortOption === "payment"
                          ? style.active__filter_selected
                          : ""
                      }
                    >
                      По ежемесячному платежу (от меньшего к большему)
                    </button>
                  </motion.li>
                  {sortOption && (
                    <motion.li
                      // whileHover={{ backgroundColor: "#fff0f0" }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <button
                        type="button"
                        onClick={resetSort}
                        className={style.active__filter_reset}
                      >
                        Сбросить сортировку
                      </button>
                    </motion.li>
                  )}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className={style.active__main}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <motion.ul
            className={style.active__list}
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.07 } },
            }}
          >
            {sortedItems.map((item) => (
              <motion.li
                key={item.id}
                className={style.active__item}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.25 }}
                layout
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className={style.active__item__badges}>
                  {item.badges.map((badge, i) => (
                    <Badge key={i} text={badge.text} style={badge.style} />
                  ))}
                </div>

                <div className={style.active__item__top}>
                  <img src={item.bankImage} alt={item.bankName} />
                  <div className={style.active__item__top__name}>
                    <p>{item.productName}</p>
                    <p>{item.bankName}</p>
                  </div>
                </div>

                <ul className={style.active__item__characteristicks}>
                  {item.characteristics.map((char, i) => (
                    <li key={i}>
                      <p>{char.label}</p>
                      <p>{char.display}</p>
                    </li>
                  ))}
                </ul>

                <div className={style.active__item__buttons}>
                  <button>
                    <Info />
                    Условия
                  </button>
                  <button>Выбрать</button>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Active;
