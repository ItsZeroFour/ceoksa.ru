import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { SWIPE_CONFIG, easeOutQuint } from "../config/swipeConfig";

export function useCardStack(cards) {
  const safeCards = Array.isArray(cards) ? cards : [];
  const count = safeCards.length;

  const [index, setIndex] = useState(0);

  const currentCardRef = useRef(null);
  const nextCardRef = useRef(null);
  const containerRef = useRef(null);

  const widthRef = useRef(300);
  const startX = useRef(0);
  const currentX = useRef(0);

  const draggingRef = useRef(false);
  const lockedRef = useRef(false);

  const rafRef = useRef(null);
  const autoTimerRef = useRef(null);
  const hidingRef = useRef(false);

  const current = useMemo(
    () => (count ? safeCards[index % count] : null),
    [index, count, safeCards]
  );

  const next = useMemo(
    () => (count > 1 ? safeCards[(index + 1) % count] : null),
    [index, count, safeCards]
  );

  const stopAll = () => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(autoTimerRef.current);
  };

  const measure = () => {
    if (currentCardRef.current) {
      widthRef.current =
        currentCardRef.current.getBoundingClientRect().width || 300;
    }
  };

  const resetStyles = () => {
    if (currentCardRef.current) {
      currentCardRef.current.style.transition = "";
      currentCardRef.current.style.transform = "translateX(0) rotate(0)";
      currentCardRef.current.style.opacity = "1";
    }
    if (nextCardRef.current) {
      nextCardRef.current.style.transition = "";
      nextCardRef.current.style.transform = `scale(${SWIPE_CONFIG.NEXT_SCALE_MIN})`;
      nextCardRef.current.style.opacity = "0.7";
    }
  };

  const animate = (from, to, onEnd) => {
    lockedRef.current = true;
    const start = performance.now();
    const duration = SWIPE_CONFIG.ANIMATION_DURATION;

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const p = easeOutQuint(t);
      const x = from + (to - from) * p;
      const r = (x / widthRef.current) * SWIPE_CONFIG.MAX_ROTATION;

      if (currentCardRef.current) {
        currentCardRef.current.style.transform = `translateX(${x}px) rotate(${r}deg)`;
        currentCardRef.current.style.opacity = `${1 - t}`;
      }

      if (nextCardRef.current) {
        const s =
          SWIPE_CONFIG.NEXT_SCALE_MIN +
          (SWIPE_CONFIG.NEXT_SCALE_MAX - SWIPE_CONFIG.NEXT_SCALE_MIN) * t;
        nextCardRef.current.style.transform = `scale(${s})`;
        nextCardRef.current.style.opacity = `${0.7 + 0.3 * t}`;
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        lockedRef.current = false;
        onEnd?.();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const scheduleAuto = useCallback(() => {
    stopAll();
    if (count <= 1) return;

    autoTimerRef.current = setTimeout(() => {
      swipeOut();
    }, SWIPE_CONFIG.AUTO_SWIPE_DELAY);
  }, [count]);

  const swipeOut = useCallback(() => {
    if (lockedRef.current || count <= 1) return;

    animate(currentX.current, widthRef.current * 1.2, () => {
      if (currentCardRef.current) {
        currentCardRef.current.style.visibility = "hidden";
      }

      hidingRef.current = true;

      currentX.current = 0;
      setIndex((i) => i + 1);
    });
  }, [count, scheduleAuto]);

  const snapBack = () => {
    animate(currentX.current, 0, () => {
      currentX.current = 0;
      resetStyles();
      scheduleAuto();
    });
  };

  const start = (x) => {
    if (lockedRef.current) return;
    stopAll();
    draggingRef.current = true;
    startX.current = x;

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
  };

  const onMove = (e) => {
    if (!draggingRef.current || lockedRef.current) return;

    const dx = Math.max(0, e.clientX - startX.current);
    currentX.current = dx;

    const p = Math.min(dx / widthRef.current, 1);
    const r = p * SWIPE_CONFIG.MAX_ROTATION;

    if (currentCardRef.current) {
      currentCardRef.current.style.transition = "none";
      currentCardRef.current.style.transform = `translateX(${dx}px) rotate(${r}deg)`;
    }

    if (nextCardRef.current) {
      const s =
        SWIPE_CONFIG.NEXT_SCALE_MIN +
        (SWIPE_CONFIG.NEXT_SCALE_MAX - SWIPE_CONFIG.NEXT_SCALE_MIN) * p;
      nextCardRef.current.style.transform = `scale(${s})`;
    }
  };

  const onEnd = () => {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onEnd);

    if (!draggingRef.current) return;
    draggingRef.current = false;

    const progress = currentX.current / widthRef.current;
    progress > SWIPE_CONFIG.THRESHOLD_DISTANCE ? swipeOut() : snapBack();
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    scheduleAuto();

    return () => {
      stopAll();
      window.removeEventListener("resize", measure);
    };
  }, [scheduleAuto]);

  useEffect(() => {
    setIndex(0);
  }, [count]);

  useEffect(() => {
    if (!hidingRef.current) return;

    requestAnimationFrame(() => {
      if (currentCardRef.current) {
        currentCardRef.current.style.visibility = "visible";
      }

      hidingRef.current = false;
      resetStyles();
      scheduleAuto();
    });
  }, [index]);

  return {
    current,
    next,
    currentCardRef,
    nextCardRef,
    containerRef,
    isSwiping: draggingRef.current,
    handleMouseDown: (e) => start(e.clientX),
    handleTouchStart: (e) => start(e.touches[0].clientX),
    handleTouchMove: (e) => {
      if (e.cancelable) e.preventDefault();
      onMove(e.touches[0]);
    },
    handleTouchEnd: onEnd,
  };
}
