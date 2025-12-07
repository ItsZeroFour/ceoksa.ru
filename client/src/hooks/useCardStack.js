import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { SWIPE_CONFIG, easeOutQuint } from "../config/swipeConfig";

export const useCardStack = (cards) => {
  const [currentIndex, setCurrentIndex] = useState(0);
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
  const isDraggingRef = useRef(false);

  const validCards = useMemo(() => {
    return Array.isArray(cards) && cards.length > 0 ? cards : [];
  }, [cards]);

  const current = useMemo(() => {
    if (validCards.length === 0) return null;
    return validCards[currentIndex % validCards.length];
  }, [validCards, currentIndex]);

  const next = useMemo(() => {
    if (validCards.length <= 1) return null;
    return validCards[(currentIndex + 1) % validCards.length];
  }, [validCards, currentIndex]);

  const updateCardWidth = useCallback(() => {
    if (currentCardRef.current) {
      const rect = currentCardRef.current.getBoundingClientRect();
      cardWidthRef.current = rect.width || 300;
    }
  }, []);

  useEffect(() => {
    updateCardWidth();
    const resizeTimer = setTimeout(updateCardWidth, 100);

    window.addEventListener("resize", updateCardWidth);
    return () => {
      window.removeEventListener("resize", updateCardWidth);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(autoSwipeTimeoutRef.current);
    };
  }, [updateCardWidth]);

  const resetCardPosition = useCallback(() => {
    if (currentCardRef.current) {
      currentCardRef.current.style.transform = "translateX(0) rotate(0)";
      currentCardRef.current.style.opacity = "1";
      currentCardRef.current.style.transition = `transform ${SWIPE_CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`;
    }

    if (nextCardRef.current && next) {
      nextCardRef.current.style.transform = `scale(${SWIPE_CONFIG.NEXT_SCALE_MIN})`;
      nextCardRef.current.style.opacity = "0.7";
      nextCardRef.current.style.transition = `transform ${
        SWIPE_CONFIG.ANIMATION_DURATION / 2
      }ms ease, opacity ${SWIPE_CONFIG.ANIMATION_DURATION / 2}ms ease`;
    }
  }, [next]);

  const triggerSwipe = useCallback(
    (isAuto = false) => {
      if (
        validCards.length <= 1 ||
        !currentCardRef.current ||
        cardWidthRef.current === 0
      )
        return;

      setIsAutoSwiping(isAuto);
      isSwipingRef.current = true;
      isDraggingRef.current = false;

      const startX = 0;
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

        if (nextCardRef.current && next) {
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
          setCurrentIndex((prev) => prev + 1);

          setTimeout(() => {
            resetCardPosition();

            isSwipingRef.current = false;
            setIsAutoSwiping(false);
            setIsSwiping(false);
            resetAutoSwipe();
          }, 0);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [validCards, next, resetCardPosition]
  );

  const resetAutoSwipe = useCallback(() => {
    clearTimeout(autoSwipeTimeoutRef.current);
    if (
      !isSwipingRef.current &&
      !isDraggingRef.current &&
      validCards.length > 1
    ) {
      autoSwipeTimeoutRef.current = setTimeout(() => {
        if (!isSwipingRef.current && !isDraggingRef.current) {
          triggerSwipe(true);
        }
      }, SWIPE_CONFIG.AUTO_SWIPE_DELAY);
    }
  }, [triggerSwipe, validCards]);

  useEffect(() => {
    resetAutoSwipe();
    return () => clearTimeout(autoSwipeTimeoutRef.current);
  }, [currentIndex, resetAutoSwipe, validCards]);

  const updateCardPosition = useCallback(
    (x, isInstant = false) => {
      if (!currentCardRef.current || cardWidthRef.current === 0) return;

      const progress = Math.min(Math.max(x / cardWidthRef.current, 0), 1);
      const rotation = (x / cardWidthRef.current) * SWIPE_CONFIG.MAX_ROTATION;

      currentCardRef.current.style.transform = `translateX(${x}px) rotate(${rotation}deg)`;
      currentCardRef.current.style.transition = isInstant ? "none" : "";

      if (nextCardRef.current && next) {
        const scale =
          SWIPE_CONFIG.NEXT_SCALE_MIN +
          (SWIPE_CONFIG.NEXT_SCALE_MAX - SWIPE_CONFIG.NEXT_SCALE_MIN) *
            progress;
        nextCardRef.current.style.transform = `scale(${scale})`;
        nextCardRef.current.style.transition = isInstant ? "none" : "";
      }
    },
    [next]
  );

  const handleStart = useCallback(
    (clientX) => {
      if (validCards.length <= 1) return;

      cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(autoSwipeTimeoutRef.current);

      swipeStartX.current = clientX;
      lastSwipeX.current = clientX;
      swipeStartTime.current = Date.now();
      isSwipingRef.current = true;
      isDraggingRef.current = true;
      setIsSwiping(true);

      if (currentCardRef.current) {
        currentCardRef.current.style.transition = "none";
      }
      if (nextCardRef.current && next) {
        nextCardRef.current.style.transition = "none";
      }
    },
    [validCards, next]
  );

  const handleMove = useCallback(
    (clientX) => {
      if (
        !isSwipingRef.current ||
        !isDraggingRef.current ||
        cardWidthRef.current === 0
      )
        return;

      const deltaX = clientX - swipeStartX.current;
      if (deltaX < 0) return;

      const clampedX = Math.min(deltaX, cardWidthRef.current * 0.8);
      updateCardPosition(clampedX, true);
      lastSwipeX.current = clientX;
    },
    [updateCardPosition]
  );

  const handleEnd = useCallback(() => {
    if (
      !isSwipingRef.current ||
      !isDraggingRef.current ||
      cardWidthRef.current === 0
    ) {
      isDraggingRef.current = false;
      setIsSwiping(false);
      resetCardPosition();
      resetAutoSwipe();
      return;
    }

    const deltaX = lastSwipeX.current - swipeStartX.current;
    const duration = Date.now() - swipeStartTime.current;
    const velocity = Math.abs(deltaX) / duration;
    const distanceProgress = deltaX / cardWidthRef.current;

    const shouldSwipe =
      velocity > SWIPE_CONFIG.THRESHOLD_VELOCITY ||
      distanceProgress > SWIPE_CONFIG.THRESHOLD_DISTANCE;

    isDraggingRef.current = false;

    if (shouldSwipe && validCards.length > 1) {
      triggerSwipe();
    } else {
      resetCardPosition();
      setTimeout(() => {
        isSwipingRef.current = false;
        setIsSwiping(false);
        resetAutoSwipe();
      }, SWIPE_CONFIG.ANIMATION_DURATION);
    }
  }, [resetAutoSwipe, triggerSwipe, validCards, resetCardPosition]);

  const handleTouchStart = useCallback(
    (e) => {
      if (e.touches?.[0]) {
        handleStart(e.touches[0].clientX);
      }
    },
    [handleStart]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isSwipingRef.current || !e.touches?.[0]) return;
      handleMove(e.touches[0].clientX);
      if (e.cancelable) e.preventDefault();
    },
    [handleMove]
  );

  const handleTouchEnd = useCallback(() => {
    if (isSwipingRef.current && isDraggingRef.current) handleEnd();
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
      if (isSwipingRef.current && isDraggingRef.current) {
        handleMove(e.clientX);
      }
    },
    [handleMove]
  );

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    if (isSwipingRef.current && isDraggingRef.current) handleEnd();
  }, [handleEnd, handleMouseMove]);

  useEffect(() => {
    if (currentCardRef.current) {
      const preventSelect = (e) => {
        if (isSwipingRef.current || isDraggingRef.current) e.preventDefault();
      };

      currentCardRef.current.addEventListener("selectstart", preventSelect);
      return () => {
        currentCardRef.current.removeEventListener(
          "selectstart",
          preventSelect
        );
      };
    }
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [validCards]);

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
    ]
  );
};
