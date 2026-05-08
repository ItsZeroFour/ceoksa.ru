import React, { useMemo } from "react";
import { motion } from "framer-motion";
import style from "./active.module.scss";
import CreditCard from "../../../../components/credit_card/CreditCard";
import sovcombank from "../../../../assets/icons/account/sovcombank.png";
import tbank from "../../../../assets/icons/tbank.png";
import sber from "../../../../assets/icons/sber.svg";

const Active = () => {
  const credits = useMemo(
    () => [
      {
        id: 1,
        bank: { name: "Совкомбанк", logo: sovcombank },
        productName: "Рефинансирование + деньги на руки",
        accountMask: "*1245",
        balance: -325926.03,
        nextPayment: { date: "21 апреля 2026 г.", amount: 15023.12 },
        status: { type: "overdue", text: "Платёж просрочен на 2 дня" },
        details: { amount: 2500000, rate: 17.9 },
      },
      {
        id: 2,
        bank: { name: "Т-Банк", logo: tbank },
        productName: "Кредит наличными Т-Банк",
        accountMask: "*3742",
        balance: -1937453.45,
        nextPayment: { date: "24 апреля 2026 г.", amount: 37453.45 },
        status: { type: "upcoming", text: "Платёж через 3 дня" },
        details: { amount: 2000000, rate: 19.5 },
      },
      {
        id: 3,
        bank: { name: "Сбербанк", logo: sber },
        productName: "Кредит на любые цели",
        accountMask: "*0769",
        balance: -27498.01,
        nextPayment: { date: "12 мая 2026 г.", amount: 5023.12 },
        status: null,
        details: { amount: 100000, rate: 14.9 },
      },
    ],
    []
  );

  return (
    <motion.section
      className={style.active}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
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
        {credits.map((credit) => (
          <motion.li
            key={credit.id}
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.25 }}
          >
            <CreditCard credit={credit} />
          </motion.li>
        ))}
      </motion.ul>
    </motion.section>
  );
};

export default Active;
