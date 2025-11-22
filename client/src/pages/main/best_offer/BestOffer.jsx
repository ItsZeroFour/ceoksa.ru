import React, { useEffect, useRef, useState } from "react";
import style from "./bestoffer.module.scss";
import { Link } from "react-router-dom";
import tbank from "../../../assets/icons/tbank.png";
import { motion, AnimatePresence } from "framer-motion";

const cards = [
  {
    id: 1,
    subtitle: "На любые цели",
    bank: "Т-Банк",
    offer: "Новое предложение",
    cost: "22,9-24,95%",
    monthly: "от 373 ₽",
    sum: "до 2 млн ₽",
  },
  {
    id: 2,
    subtitle: "Крупные покупки",
    bank: "Сбер банк",
    offer: "Специально для вас",
    cost: "17,3-19,4%",
    monthly: "от 510 ₽",
    sum: "до 3 млн ₽",
  },
  {
    id: 3,
    subtitle: "На любые цели",
    bank: "ВТБ",
    offer: "Выбор клиентов",
    cost: "19,2-21,5%",
    monthly: "от 420 ₽",
    sum: "до 1.5 млн ₽",
  },
];

const BestOffer = () => {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  const swipeRight = () => {
    setIndex((prev) => (prev + 1) % cards.length);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => swipeRight(), 5000);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(intervalRef.current);
  }, []);

  const card = cards[index];

  return (
    <section className={style.best_offer}>
      <div className="container">
        <div className={style.best_offer__wrapper}>
          <div className={style.best_offer__left}>
            <h2>Лучшие предложения <br /> на сегодня</h2>
            <p>
              Лучшие предложения от ведущих банков с минимальными ставками и
              прозрачными условиями
            </p>

            <Link to="/">Оставить заявку</Link>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={card.id}
              className={style.best_offer__right}
              drag="x"
              dragConstraints={{ left: 0, right: 350 }}
              dragElastic={0}
              dragMomentum={false}
              // onDrag={(e, info) => {
              //   if (info.offset.x < 0) e.preventDefault();
              // }}
              onDragEnd={(e, info) => {
                if (info.offset.x > 150 || info.velocity.x > 500) {
                  swipeRight();
                  resetTimer();
                }
              }}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 350, rotate: 15 }}
              transition={{ duration: 0.35 }}
            >
              <div className={style.best_offer__right__top}>
                <div className={style.best_offer__right__top__bank}>
                  <img src={tbank} alt="Т-банк" />

                  <div className={style.best_offer__right__top__title}>
                    <p>{card.subtitle}</p>
                    <h3>{card.bank}</h3>
                  </div>
                </div>

                <div className={style.best_offer__right__top__die}>
                  <p>{card.offer}</p>
                </div>
              </div>

              <div className={style.best_offer__right__main}>
                <div className={style.best_offer__right__main__credit_item}>
                  <p>Полная стоимость кредита</p>
                  <p>{card.cost}</p>
                </div>

                <div className={style.best_offer__right__main__other}>
                  <div className={style.best_offer__right__main__credit_item}>
                    <p>Платёж в месяц</p>
                    <p>{card.monthly}</p>
                  </div>

                  <div className={style.best_offer__right__main__credit_item}>
                    <p>Сумма кредита</p>
                    <p>{card.sum}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default BestOffer;
