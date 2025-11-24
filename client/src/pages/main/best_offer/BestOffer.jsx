import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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

const SWIPE_THRESHOLD_VELOCITY = 0.3;
const SWIPE_THRESHOLD_DISTANCE = 0.35;
const MAX_ROTATION = 15;
const NEXT_SCALE_MIN = 0.92;
const NEXT_SCALE_MAX = 1;
const AUTO_SWIPE_DELAY = 2000;
const ANIMATION_DURATION = 800;
const SWIPE_END_POSITION_MULTIPLIER = 1.5;

const easeOutQuint = (x) => 1 - Math.pow(1 - x, 5);

const BestOffer = ({ scrollToBlock }) => {
  const [stack, setStack] = useState(initialCards);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isAutoSwiping, setIsAutoSwiping] = useState(false);

  const currentCardRef = useRef(null);
  const nextCardRef = useRef(null);
  const containerRef = useRef(null);

  const swipeStartX = useRef(0);
  const lastSwipeX = useRef(0);
  const swipeStartTime = useRef(0);
  const animationFrameRef = useRef(null);
  const autoSwipeTimeoutRef = useRef(null);
  const isSwipingRef = useRef(false);
  const cardWidthRef = useRef(0);

  const current = useMemo(() => stack[0], [stack]);
  const next = useMemo(() => stack[1] || initialCards[0], [stack]);

  useEffect(() => {
    const updateCardWidth = () => {
      if (currentCardRef.current) {
        cardWidthRef.current = currentCardRef.current.offsetWidth;
      }
    };

    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);

    return () => {
      window.removeEventListener("resize", updateCardWidth);
      cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(autoSwipeTimeoutRef.current);
    };
  }, []);

  const resetAutoSwipe = useCallback(() => {
    clearTimeout(autoSwipeTimeoutRef.current);
    autoSwipeTimeoutRef.current = setTimeout(() => {
      if (!isSwipingRef.current) {
        triggerSwipe(true);
      }
    }, AUTO_SWIPE_DELAY);
  }, []);

  useEffect(() => {
    resetAutoSwipe();
  }, [stack, resetAutoSwipe]);

  const updateCardPosition = useCallback((x, isInstant = false) => {
    if (
      !currentCardRef.current ||
      !nextCardRef.current ||
      cardWidthRef.current === 0
    )
      return;

    const progress = Math.min(Math.max(x / cardWidthRef.current, 0), 1);
    const rotation = (x / cardWidthRef.current) * MAX_ROTATION;

    currentCardRef.current.style.transform = `translate3d(${x}px,0,0) rotate(${rotation}deg)`;
    currentCardRef.current.style.transition = isInstant
      ? "none"
      : `transform ${ANIMATION_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`;

    const scale = NEXT_SCALE_MIN + (NEXT_SCALE_MAX - NEXT_SCALE_MIN) * progress;
    nextCardRef.current.style.transform = `scale(${scale})`;
    nextCardRef.current.style.transition = isInstant
      ? "none"
      : `transform ${ANIMATION_DURATION / 2}ms ease`;
  }, []);

  const triggerSwipe = useCallback(
    (isAuto = false) => {
      if (!currentCardRef.current || cardWidthRef.current === 0) return;

      setIsAutoSwiping(isAuto);
      isSwipingRef.current = true;

      const startX = parseFloat(
        currentCardRef.current.style.transform.match(/-?[\d.]+/)?.[0] || "0"
      );
      const endX = cardWidthRef.current * SWIPE_END_POSITION_MULTIPLIER;
      const duration = ANIMATION_DURATION;
      let startTime = null;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuint(progress);

        const currentX = startX + (endX - startX) * easedProgress;
        const rotation = (currentX / cardWidthRef.current) * MAX_ROTATION;

        const opacity = 1 - easedProgress;

        if (currentCardRef.current) {
          currentCardRef.current.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;
          currentCardRef.current.style.opacity = opacity.toString();
          currentCardRef.current.style.transition = "none";
        }

        if (nextCardRef.current) {
          const scaleProgress = Math.min(progress * 1.5, 1);
          const scale =
            NEXT_SCALE_MIN + (NEXT_SCALE_MAX - NEXT_SCALE_MIN) * scaleProgress;
          const nextOpacity = 0.7 + 0.3 * scaleProgress;

          nextCardRef.current.style.transform = `scale(${scale})`;
          nextCardRef.current.style.opacity = nextOpacity.toString();
          nextCardRef.current.style.transition = "none";
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setStack((prev) => {
            const [, ...rest] = prev;
            return rest.length ? rest : [...initialCards];
          });

          setTimeout(() => {
            if (currentCardRef.current) {
              currentCardRef.current.style.transform =
                "translateX(0) rotate(0)";
              currentCardRef.current.style.opacity = "1";
              currentCardRef.current.style.transition = "none";
            }

            if (nextCardRef.current) {
              nextCardRef.current.style.transform = `scale(${NEXT_SCALE_MIN})`;
              nextCardRef.current.style.opacity = "0.7";
              nextCardRef.current.style.transition = "none";
            }

            requestAnimationFrame(() => {
              if (currentCardRef.current) {
                currentCardRef.current.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`;
              }
              if (nextCardRef.current) {
                nextCardRef.current.style.transition = `transform ${
                  ANIMATION_DURATION / 2
                }ms ease`;
              }
            });

            isSwipingRef.current = false;
            setIsAutoSwiping(false);
            resetAutoSwipe();
          }, 0);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [resetAutoSwipe]
  );

  const handleStart = useCallback(
    (clientX) => {
      if (isAutoSwiping) return;

      cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(autoSwipeTimeoutRef.current);

      swipeStartX.current = clientX;
      lastSwipeX.current = clientX;
      swipeStartTime.current = Date.now();
      isSwipingRef.current = true;
      setIsSwiping(true);

      if (currentCardRef.current) {
        currentCardRef.current.style.transition = "none";
      }
      if (nextCardRef.current) {
        nextCardRef.current.style.transition = "none";
      }
    },
    [isAutoSwiping]
  );

  const handleMove = useCallback(
    (clientX) => {
      if (!isSwipingRef.current || cardWidthRef.current === 0) return;

      const deltaX = clientX - swipeStartX.current;
      const clampedX = Math.min(
        Math.max(deltaX, 0),
        cardWidthRef.current * 0.8
      );

      updateCardPosition(clampedX, true);

      lastSwipeX.current = clientX;
    },
    [updateCardPosition]
  );

  const handleEnd = useCallback(() => {
    if (!isSwipingRef.current || cardWidthRef.current === 0) {
      setIsSwiping(false);
      return;
    }

    const deltaX = lastSwipeX.current - swipeStartX.current;
    const duration = Date.now() - swipeStartTime.current;
    const velocity = Math.abs(deltaX) / duration;
    const distanceProgress = deltaX / cardWidthRef.current;

    const shouldSwipe =
      velocity > SWIPE_THRESHOLD_VELOCITY ||
      distanceProgress > SWIPE_THRESHOLD_DISTANCE;

    if (shouldSwipe) {
      triggerSwipe();
    } else {
      if (currentCardRef.current) {
        currentCardRef.current.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`;
        currentCardRef.current.style.transform = "translateX(0) rotate(0)";
      }

      if (nextCardRef.current) {
        nextCardRef.current.style.transition = `transform ${
          ANIMATION_DURATION / 2
        }ms ease`;
        nextCardRef.current.style.transform = `scale(${NEXT_SCALE_MIN})`;
      }

      setTimeout(() => {
        isSwipingRef.current = false;
        setIsSwiping(false);
        resetAutoSwipe();
      }, ANIMATION_DURATION);
    }
  }, [resetAutoSwipe, triggerSwipe]);

  const handleTouchStart = useCallback(
    (e) => {
      handleStart(e.touches[0].clientX);
    },
    [handleStart]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isSwipingRef.current) return;
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  const handleTouchEnd = useCallback(() => {
    if (isSwipingRef.current) handleEnd();
  }, [handleEnd]);

  const handleMouseDown = useCallback(
    (e) => {
      handleStart(e.clientX);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleStart]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isSwipingRef.current) return;
      handleMove(e.clientX);
    },
    [handleMove]
  );

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    if (isSwipingRef.current) handleEnd();
  }, [handleEnd, handleMouseMove]);

  useEffect(() => {
    const card = currentCardRef.current;
    if (!card) return;

    const preventSelect = (e) => {
      if (isSwipingRef.current) e.preventDefault();
    };

    card.addEventListener("selectstart", preventSelect);
    return () => {
      card.removeEventListener("selectstart", preventSelect);
    };
  }, []);

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
                  transform: `scale(${NEXT_SCALE_MIN})`,
                  opacity: "0.7",
                  zIndex: 1,
                  transition: `transform ${
                    ANIMATION_DURATION / 2
                  }ms ease, opacity ${ANIMATION_DURATION / 2}ms ease`,
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
                  transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`,
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
