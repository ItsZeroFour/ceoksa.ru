import React from "react";
import { motion } from "framer-motion";
import style from "./payments.module.scss";
import ProgressBar from "../../../../components/progress_bar/ProgressBar";

const Payments = () => {
  return (
    <motion.div
      className={style.payments}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={style.payments__wrapper}>
        <motion.div
          className={style.payments__top}
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15 },
            },
          }}
        >
          <motion.div
            className={style.payments__top__item}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
          >
            <motion.h4
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              Нагрузка по платежам
            </motion.h4>

            <motion.div
              className={style.payments__top__item__status}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <p>17% от вашего официального дохода</p>
              <motion.div
                className={style.payments__top__item__status__status}
                style={{ background: "#4cbd20" }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                Низкая
              </motion.div>
            </motion.div>

            <ProgressBar percent={17} color="#4cbd20" height="12px" />
          </motion.div>

          <motion.div
            className={style.payments__top__item}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
          >
            <motion.div
              className={style.payments__top__item__text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h4
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                Ваш ежемесячный платеж
              </motion.h4>
              <motion.div
                className={style.payments__top__item__text__pay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                29 658,23 ₽/мес
              </motion.div>
            </motion.div>

            <motion.p
              className={style.payments__top__item__description}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Кредитные карты учитываются в нагрузке, даже если вы ими не
              пользуетесь
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          className={style.payments__bottom}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div
            className={style.payments__bottom__left}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className={style.payments__bottom__salary}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h4>Ваш доход</h4>
              <motion.div
                className={style.payments__bottom__salary__salary}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                190 000 ₽/мес
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Банки учитывают только официальный доход
            </motion.p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Изменить данные о доходе
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Payments;
