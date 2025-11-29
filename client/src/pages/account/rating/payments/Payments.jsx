import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import style from "./payments.module.scss";
import ProgressBar from "../../../../components/progress_bar/ProgressBar";
import { useSalaryValidation } from "../../../../hooks/useSalaryValidation";
import Notification from "../../../../components/notification/Notification";

const SalaryModal = ({ setOpenModal }) => {
  const {
    salaryError,
    displaySalary,
    handleSalaryChange,
    handleSalaryFocus,
    handleSalaryBlur,
  } = useSalaryValidation();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setOpenModal(false);
    }
  };

  return (
    <motion.div
      className={style.modal}
      onClick={handleOverlayClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={style.modal__wrapper}
        initial={{ scale: 0.95, opacity: 0, y: "20px" }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: "20px" }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <button
          className={style.modal__close}
          onClick={() => setOpenModal(false)}
        />

        <h3>Ваш доход в месяц</h3>
        <p>
          Укажите ваш официальный доход. Это поможет точнее рассчитать ваш
          рейтинг и кредитную нагрузку
        </p>

        <form>
          <div
            className={`${style.modal__input} ${
              salaryError ? style.error : ""
            }`}
          >
            <label htmlFor="salary">Размер заработной платы</label>
            <input
              id="salary"
              type="text"
              inputMode="numeric"
              placeholder="Например, 100 000 ₽"
              value={displaySalary}
              onChange={handleSalaryChange}
              onFocus={handleSalaryFocus}
              onBlur={handleSalaryBlur}
            />
          </div>

          <button>Сохранить</button>
        </form>

        <Notification text="Мы не передаём данные в другие организации — используем их только в нашем сервисе для точных расчётов" />
      </motion.div>
    </motion.div>
  );
};

const Payments = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <motion.div
      className={style.payments}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {openModal && (
          <SalaryModal key="salary-modal" setOpenModal={setOpenModal} />
        )}
      </AnimatePresence>

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
            onClick={() => setOpenModal(true)}
          >
            Изменить данные о доходе
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Payments;
