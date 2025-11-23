import React, { useState, useRef, useEffect } from "react";
import style from "./bestoffer.module.scss";
import { Link } from "react-router-dom";
import tbank from "../../../assets/icons/tbank.png";
import vtb from "../../../assets/icons/vtb.png";
import sber from "../../../assets/icons/sber.svg";

const initialCards = [
  {
    id: 1,
    subtitle: "На любые цели",
    bank: "Т-Банк",
    offer: "Новое предложение",
    cost: "22,9-24,95%",
    monthly: "от 373 ₽",
    sum: "до 2 млн ₽",
    img: tbank,
  },
  {
    id: 2,
    subtitle: "Крупные покупки",
    bank: "Сбер банк",
    offer: "Специально для вас",
    cost: "17,3-19,4%",
    monthly: "от 510 ₽",
    sum: "до 3 млн ₽",
    img: sber,
  },
  {
    id: 3,
    subtitle: "На любые цели",
    bank: "ВТБ",
    offer: "Выбор клиентов",
    cost: "19,2-21,5%",
    monthly: "от 420 ₽",
    sum: "до 1.5 млн ₽",
    img: vtb,
  },
];

const MAX_DRAG = 140;
const SWIPE_THRESHOLD = 120;
const NEXT_SCALE_MIN = 0.95;
const NEXT_SCALE_MAX = 1;

const BestOffer = ({ scrollToBlock }) => {
  const [stack, setStack] = useState(initialCards);
  const [posX, setPosX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const auto = useRef(null);

  const swipeProgress = Math.min(posX / SWIPE_THRESHOLD, 1);
  const nextScale =
    NEXT_SCALE_MIN + (NEXT_SCALE_MAX - NEXT_SCALE_MIN) * swipeProgress;

  const current = stack[0];
  const next = stack.length > 1 ? stack[1] : initialCards[0];

  const resetAuto = () => {
    clearTimeout(auto.current);
    auto.current = setTimeout(() => {
      forceSwipe();
    }, 5000);
  };

  useEffect(() => {
    resetAuto();
    return () => clearTimeout(auto.current);
  }, [stack]);

  const start = (e) => {
    resetAuto();
    setSwiping(true);
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const move = (e) => {
    if (!swiping) return;

    const x = e.touches ? e.touches[0].clientX : e.clientX;
    let delta = x - startX.current;

    if (delta < 0) delta = 0;

    if (delta > MAX_DRAG) delta = MAX_DRAG;

    setPosX(delta);
  };

  const end = () => {
    if (!swiping) return;

    if (posX > SWIPE_THRESHOLD) {
      forceSwipe();
    } else {
      setSwiping(false);
      setPosX(0);
    }
  };

  const forceSwipe = () => {
    setSwiping(false);
    let start = null;
    const duration = 200;
    const startX = 0;
    const endX = 800;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const nextX = Math.min(
        startX + (endX - startX) * Math.min(progress / duration, 1),
        endX
      );
      setPosX(nextX);
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setStack((prev) => {
          const [, ...rest] = prev;
          return rest.length === 0 ? initialCards : rest;
        });
        setPosX(0);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <section className={style.best_offer}>
      <div className="container">
        <div className={style.best_offer__wrapper}>
          <div className={style.best_offer__left}>
            <h2>
              Лучшие предложения <br /> на сегодня
            </h2>
            <p>
              Лучшие предложения от ведущих банков с минимальными ставками и
              прозрачными условиями
            </p>
            <Link to="#" onClick={() => scrollToBlock("credit")}>
              Оставить заявку
            </Link>
          </div>

          <div className={style.best_offer__right__container}>
            <div className={style.stack}>
              <div
                className={`${style.best_offer__right} ${style.best_offer__right__next}`}
                style={{
                  transform: `scale(${nextScale})`,
                  transition: swiping ? "none" : "0.2s ease",
                }}
              >
                <div className={style.best_offer__right__top}>
                  <div className={style.best_offer__right__top__bank}>
                    <img src={next.img} alt={next.bank} />
                    <div className={style.best_offer__right__top__title}>
                      <p>{next.subtitle}</p>
                      <h3>{next.bank}</h3>
                    </div>
                  </div>
                  <div className={style.best_offer__right__top__die}>
                    <p>{next.offer}</p>
                  </div>
                </div>

                <div className={style.best_offer__right__main}>
                  <div className={style.best_offer__right__main__credit_item}>
                    <p>Полная стоимость кредита</p>
                    <p>{next.cost}</p>
                  </div>

                  <div className={style.best_offer__right__main__other}>
                    <div className={style.best_offer__right__main__credit_item}>
                      <p>Платёж в месяц</p>
                      <p>{next.monthly}</p>
                    </div>
                    <div className={style.best_offer__right__main__credit_item}>
                      <p>Сумма кредита</p>
                      <p>{next.sum}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                key={current.id}
                className={style.best_offer__right}
                onMouseDown={start}
                onMouseMove={move}
                onMouseUp={end}
                onMouseLeave={() => swiping && end()}
                onTouchStart={start}
                onTouchMove={move}
                onTouchEnd={end}
                style={{
                  transform: `translateX(${posX}px) rotate(${posX / 18}deg)`,
                  transition: swiping ? "none" : "0.15s linear",
                }}
              >
                <div className={style.best_offer__right__top}>
                  <div className={style.best_offer__right__top__bank}>
                    <img src={current.img} alt={current.bank} />
                    <div className={style.best_offer__right__top__title}>
                      <p>{current.subtitle}</p>
                      <h3>{current.bank}</h3>
                    </div>
                  </div>
                  <div className={style.best_offer__right__top__die}>
                    <p>{current.offer}</p>
                  </div>
                </div>

                <div className={style.best_offer__right__main}>
                  <div className={style.best_offer__right__main__credit_item}>
                    <p>Полная стоимость кредита</p>
                    <p>{current.cost}</p>
                  </div>

                  <div className={style.best_offer__right__main__other}>
                    <div className={style.best_offer__right__main__credit_item}>
                      <p>Платёж в месяц</p>
                      <p>{current.monthly}</p>
                    </div>
                    <div className={style.best_offer__right__main__credit_item}>
                      <p>Сумма кредита</p>
                      <p>{current.sum}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestOffer;
