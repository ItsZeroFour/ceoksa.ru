import React from "react";
import style from "./bestoffer.module.scss";
import { Link } from "react-router-dom";
import tbank from "../../../assets/icons/tbank.png";
import vtb from "../../../assets/icons/vtb.png";
import sber from "../../../assets/icons/sber.svg";
import { useCardStack } from "../../../hooks/useCardStack";
import { SWIPE_CONFIG } from "../../../config/swipeConfig";

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

const BestOffer = ({ scrollToBlock }) => {
  const {
    current,
    next,
    currentCardRef,
    nextCardRef,
    containerRef,
    isSwiping,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useCardStack(initialCards);

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
            <div
              ref={containerRef}
              className={style.stack}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              style={{ touchAction: "pan-y" }}
            >
              <div
                ref={nextCardRef}
                className={`${style.best_offer__right} ${style.best_offer__right__next}`}
                style={{
                  transform: `scale(${SWIPE_CONFIG.NEXT_SCALE_MIN})`,
                  opacity: "0.7",
                  zIndex: 1,
                  transition: `transform ${
                    SWIPE_CONFIG.ANIMATION_DURATION / 2
                  }ms ease, opacity ${
                    SWIPE_CONFIG.ANIMATION_DURATION / 2
                  }ms ease`,
                }}
              >
                <CardContent data={next} />
              </div>

              <div
                key={current.id}
                ref={currentCardRef}
                className={style.best_offer__right}
                style={{
                  transform: "translateX(0) rotate(0)",
                  opacity: "1",
                  zIndex: 2,
                  cursor: isSwiping ? "grabbing" : "grab",
                  transition: `transform ${SWIPE_CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`,
                }}
              >
                <CardContent data={current} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CardContent = ({ data }) => (
  <>
    <div className={style.best_offer__right__top}>
      <div className={style.best_offer__right__top__bank}>
        <img src={data.img} alt={data.bank} />
        <div className={style.best_offer__right__top__title}>
          <p>{data.subtitle}</p>
          <h3>{data.bank}</h3>
        </div>
      </div>
      <div className={style.best_offer__right__top__die}>
        <p>{data.offer}</p>
      </div>
    </div>

    <div className={style.best_offer__right__main}>
      <div className={style.best_offer__right__main__credit_item}>
        <p>Полная стоимость кредита</p>
        <p>{data.cost}</p>
      </div>

      <div className={style.best_offer__right__main__other}>
        <div className={style.best_offer__right__main__credit_item}>
          <p>Платёж в месяц</p>
          <p>{data.monthly}</p>
        </div>
        <div className={style.best_offer__right__main__credit_item}>
          <p>Сумма кредита</p>
          <p>{data.sum}</p>
        </div>
      </div>
    </div>
  </>
);

export default BestOffer;
