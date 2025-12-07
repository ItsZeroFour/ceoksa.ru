import React, { useEffect, useRef } from "react";
import style from "./bestoffer.module.scss";
import { Link } from "react-router-dom";
import { useCardStack } from "../../../hooks/useCardStack";
import { SWIPE_CONFIG } from "../../../config/swipeConfig";
import { useDispatch, useSelector } from "react-redux";
import { fetchBestoffer } from "../../../redux/slices/strapi/bestofferSlice";
import BestOfferSceleton from "../../../components/sceletons/BestOfferSceleton";

const BestOffer = ({ scrollToBlock }) => {
  const dispatch = useDispatch();
  const { data, status } = useSelector((state) => state.bestoffer);
  const cardsRef = useRef([]);

  useEffect(() => {
    dispatch(fetchBestoffer("luchshie-predlozheniya?populate=cards.logo"));
  }, [dispatch]);

  const isDataReady =
    status === "succeeded" &&
    data?.cards &&
    Array.isArray(data.cards) &&
    data.cards.length > 0 &&
    data?.title &&
    data?.description &&
    data?.button_text;

  if (isDataReady) {
    cardsRef.current = data.cards;
  }

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
  } = useCardStack(cardsRef.current);

  if (status === "loading") {
    return (
      <section className={style.best_offer}>
        <div className="container">
          <BestOfferSceleton />
        </div>
      </section>
    );
  }

  if (status === "failed" || !isDataReady) {
    return null;
  }

  return (
    <section className={style.best_offer}>
      <div className="container">
        <div className={style.best_offer__wrapper}>
          <div className={style.best_offer__left}>
            <h2>
              {data.title.split("\\n").map((line, i, arr) => (
                <React.Fragment key={i}>
                  {line.trim()}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>
            <p>{data.description}</p>
            <Link to="#" onClick={() => scrollToBlock("credit")}>
              {data.button_text}
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
              style={{
                touchAction: "none",
                WebkitUserSelect: "none",
                userSelect: "none",
              }}
            >
              {next && (
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
              )}

              {current && (
                <div
                  key={current.id || current.bank_name}
                  ref={currentCardRef}
                  className={style.best_offer__right}
                  style={{
                    transform: "translateX(0) rotate(0)",
                    opacity: "1",
                    zIndex: 2,
                    cursor: isSwiping ? "grabbing" : "grab",
                  }}
                >
                  <CardContent data={current} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CardContent = ({ data }) => {
  if (!data) return null;

  return (
    <>
      <div className={style.best_offer__right__top}>
        <div className={style.best_offer__right__top__bank}>
          <img
            src={`${process.env.REACT_APP_ADMIN_IMAGES}${data.logo.url}`}
            alt={data.bank_name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-bank.png";
            }}
          />
          <div className={style.best_offer__right__top__title}>
            <p>{data.for}</p>
            <h3>{data.bank_name}</h3>
          </div>
        </div>
        <div className={style.best_offer__right__top__die}>
          <p>{data.die}</p>
        </div>
      </div>

      <div className={style.best_offer__right__main}>
        <div className={style.best_offer__right__main__credit_item}>
          <p>Полная стоимость кредита</p>
          <p>{data.full_price}</p>
        </div>

        <div className={style.best_offer__right__main__other}>
          <div className={style.best_offer__right__main__credit_item}>
            <p>Платёж в месяц</p>
            <p>{data.month_pay}</p>
          </div>
          <div className={style.best_offer__right__main__credit_item}>
            <p>Сумма кредита</p>
            <p>{data.sum}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BestOffer;
