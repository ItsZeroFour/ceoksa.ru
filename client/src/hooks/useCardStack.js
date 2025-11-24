import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { SWIPE_CONFIG, easeOutQuint } from "../config/swipeConfig";

export const useCardStack = (initialCards) => {
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
  const next = useMemo(
    () => stack[1] || initialCards[0],
    [stack, initialCards]
  );

  const updateCardWidth = useCallback(() => {
    if (currentCardRef.current) {
      cardWidthRef.current = currentCardRef.current.offsetWidth;
    }
  }, []);

  useEffect(() => {
    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);

    return () => {
      window.removeEventListener("resize", updateCardWidth);
      cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(autoSwipeTimeoutRef.current);
    };
  }, [updateCardWidth]);

  const triggerSwipe = useCallback(
    (isAuto = false) => {
      if (!currentCardRef.current || cardWidthRef.current === 0) return;

      setIsAutoSwiping(isAuto);
      isSwipingRef.current = true;

      const startX = parseFloat(
        currentCardRef.current.style.transform.match(/-?[\d.]+/)?.[0] || "0"
      );
      const endX =
        cardWidthRef.current * SWIPE_CONFIG.SWIPE_END_POSITION_MULTIPLIER;
      const duration = SWIPE_CONFIG.ANIMATION_DURATION;
      let startTime = null;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuint(progress);

        const currentX = startX + (endX - startX) * easedProgress;
        const rotation =
          (currentX / cardWidthRef.current) * SWIPE_CONFIG.MAX_ROTATION;
        const opacity = 1 - easedProgress;

        if (currentCardRef.current) {
          currentCardRef.current.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;
          currentCardRef.current.style.opacity = opacity.toString();
          currentCardRef.current.style.transition = "none";
        }

        if (nextCardRef.current) {
          const scaleProgress = Math.min(progress * 1.5, 1);
          const scale =
            SWIPE_CONFIG.NEXT_SCALE_MIN +
            (SWIPE_CONFIG.NEXT_SCALE_MAX - SWIPE_CONFIG.NEXT_SCALE_MIN) *
              scaleProgress;
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
              nextCardRef.current.style.transform = `scale(${SWIPE_CONFIG.NEXT_SCALE_MIN})`;
              nextCardRef.current.style.opacity = "0.7";
              nextCardRef.current.style.transition = "none";
            }

            requestAnimationFrame(() => {
              if (currentCardRef.current) {
                currentCardRef.current.style.transition = `transform ${SWIPE_CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`;
              }
              if (nextCardRef.current) {
                nextCardRef.current.style.transition = `transform ${
                  SWIPE_CONFIG.ANIMATION_DURATION / 2
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
    [initialCards]
  );

  const resetAutoSwipe = useCallback(() => {
    clearTimeout(autoSwipeTimeoutRef.current);
    autoSwipeTimeoutRef.current = setTimeout(() => {
      if (!isSwipingRef.current) {
        triggerSwipe(true);
      }
    }, SWIPE_CONFIG.AUTO_SWIPE_DELAY);
  }, [triggerSwipe]);

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
    const rotation = (x / cardWidthRef.current) * SWIPE_CONFIG.MAX_ROTATION;

    currentCardRef.current.style.transform = `translate3d(${x}px,0,0) rotate(${rotation}deg)`;
    currentCardRef.current.style.transition = isInstant
      ? "none"
      : `transform ${SWIPE_CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`;

    const scale =
      SWIPE_CONFIG.NEXT_SCALE_MIN +
      (SWIPE_CONFIG.NEXT_SCALE_MAX - SWIPE_CONFIG.NEXT_SCALE_MIN) * progress;
    nextCardRef.current.style.transform = `scale(${scale})`;
    nextCardRef.current.style.transition = isInstant
      ? "none"
      : `transform ${SWIPE_CONFIG.ANIMATION_DURATION / 2}ms ease`;
  }, []);

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
      velocity > SWIPE_CONFIG.THRESHOLD_VELOCITY ||
      distanceProgress > SWIPE_CONFIG.THRESHOLD_DISTANCE;

    if (shouldSwipe) {
      triggerSwipe();
    } else {
      if (currentCardRef.current) {
        currentCardRef.current.style.transition = `transform ${SWIPE_CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`;
        currentCardRef.current.style.transform = "translateX(0) rotate(0)";
      }

      if (nextCardRef.current) {
        nextCardRef.current.style.transition = `transform ${
          SWIPE_CONFIG.ANIMATION_DURATION / 2
        }ms ease`;
        nextCardRef.current.style.transform = `scale(${SWIPE_CONFIG.NEXT_SCALE_MIN})`;
      }

      setTimeout(() => {
        isSwipingRef.current = false;
        setIsSwiping(false);
        resetAutoSwipe();
      }, SWIPE_CONFIG.ANIMATION_DURATION);
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

  return useMemo(
    () => ({
      current,
      next,
      isSwiping,
      isAutoSwiping,
      currentCardRef,
      nextCardRef,
      containerRef,
      handleMouseDown,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      triggerSwipe,
      resetAutoSwipe,
    }),
    [
      current,
      next,
      isSwiping,
      isAutoSwiping,
      handleMouseDown,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      triggerSwipe,
      resetAutoSwipe,
    ]
  );
};
