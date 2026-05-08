import React, { useMemo } from "react";
import { motion } from "framer-motion";
import style from "./archive.module.scss";
import CreditCard from "../../../../components/credit_card/CreditCard";
import sovcombank from "../../../../assets/icons/account/sovcombank.png";
import tbank from "../../../../assets/icons/tbank.png";

const Archive = () => {
  const credits = useMemo(
    () => [
      {
        id: 1,
        bank: { name: "Совкомбанк", logo: sovcombank },
        productName: "Рефинансирование + деньги на руки",
        accountMask: "*1245",
        contractAmount: 1325000,
        closeDate: "12.04.2026 г.",
        details: { amount: 2500000, rate: 17.9 },
      },
      {
        id: 2,
        bank: { name: "Т-Банк", logo: tbank },
        productName: "Кредит наличными Т-Банк",
        accountMask: "*1245",
        contractAmount: 1400000,
        closeDate: "24.12.2025 г.",
        details: { amount: 1400000, rate: 19.5 },
      },
    ],
    []
  );

  if (!credits.length) {
    return (
      <section className={style.archive_empty}>
        <div className={style.archive_empty__inner}>
          <h2>Здесь будут отображаться закрытые кредиты</h2>
          <p>Когда кредит будет полностью погашен, он переместится в архив.</p>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className={style.archive}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.ul
        className={style.archive__list}
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07 } },
        }}
      >
        {credits.map((credit) => (
          <motion.li
            key={credit.id}
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.25 }}
          >
            <CreditCard credit={credit} archived />
          </motion.li>
        ))}
      </motion.ul>
    </motion.section>
  );
};

export default Archive;
