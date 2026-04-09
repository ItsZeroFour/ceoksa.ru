import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "./verification.module.scss";
import { ReactComponent as Shield } from "../../../../assets/icons/info.svg";
import {
  startVerification,
  completeIdentification,
  resetRim,
} from "../../../../redux/slices/rim/rimSlice";
import useIsMobile from "../../../../hooks/useIsMobile";

const POLL_INTERVAL = 3000;
const INITIAL_DELAY = 2000;
const MAX_ATTEMPTS = 30;

const Verification = () => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();

  const { isIframeOpen, isLoading, error } = useSelector((state) => state.rim);
  const user = useSelector((state) => state.auth);
  const userRim = user?.user?.data?.rim;

  const savedStatus = userRim?.identificationStatus;
  const isVerified = savedStatus === "identificationSucceeded";
  const isFailed =
    savedStatus === "identificationFailed" || savedStatus === "systemError";
  const hasStarted = !!userRim?.lastRequestGuid;

  const [processingState, setProcessingState] = useState(null);
  const wasIframeOpenRef = useRef(false);
  const pollingTimerRef = useRef(null);
  const attemptCountRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    attemptCountRef.current = 0;
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    setProcessingState("polling");
    attemptCountRef.current = 0;

    const poll = async () => {
      attemptCountRef.current += 1;

      try {
        const result = await dispatch(completeIdentification()).unwrap();

        if (result.isSucceeded) {
          setProcessingState("succeeded");
          setTimeout(() => window.location.reload(), 500);
          return;
        }

        if (
          result.status === "identificationFailed" ||
          result.status === "systemError"
        ) {
          setProcessingState("failed");
          return;
        }

        if (attemptCountRef.current < MAX_ATTEMPTS) {
          pollingTimerRef.current = setTimeout(poll, POLL_INTERVAL);
        } else {
          setProcessingState("timeout");
        }
      } catch {
        if (attemptCountRef.current < MAX_ATTEMPTS) {
          pollingTimerRef.current = setTimeout(poll, POLL_INTERVAL);
        } else {
          setProcessingState("timeout");
        }
      }
    };

    pollingTimerRef.current = setTimeout(poll, INITIAL_DELAY);
  }, [dispatch, stopPolling]);

  useEffect(() => {
    if (isIframeOpen) {
      wasIframeOpenRef.current = true;
      return;
    }

    if (wasIframeOpenRef.current) {
      wasIframeOpenRef.current = false;
      startPolling();
    }
  }, [isIframeOpen, startPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleStart = () => {
    setProcessingState(null);
    dispatch(startVerification());
  };

  const handleRetry = () => {
    setProcessingState(null);
    dispatch(resetRim());
    dispatch(startVerification());
  };

  if (processingState === "polling" || processingState === "succeeded") {
    return (
      <section className={style.verification}>
        <div className={style.verification__wrapper}>
          <h2>Верификация личности</h2>
          <div className={style.verification__content}>
            <div
              className={style.verification__status}
              style={{ borderColor: "#3498db" }}
            >
              <span className={style.verification__status__icon}>⏳</span>
              <span className={style.verification__status__text}>
                {processingState === "succeeded"
                  ? "Данные получены, обновляем страницу..."
                  : "Обработка результатов верификации..."}
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (processingState === "timeout") {
    return (
      <section className={style.verification}>
        <div className={style.verification__wrapper}>
          <h2>Верификация личности</h2>
          <div className={style.verification__content}>
            <div className={style.verification__info}>
              <div className={style.verification__info__icon}>
                <Shield />
              </div>
              <div className={style.verification__info__text}>
                <p>
                  Данные от МТС ещё обрабатываются. Обновите страницу через
                  минуту — результаты появятся автоматически.
                </p>
              </div>
            </div>
            <div className={style.verification__actions}>
              <button
                className={style.verification__button}
                onClick={() => window.location.reload()}
              >
                Обновить страницу
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={style.verification}>
      <div className={style.verification__wrapper}>
        <h2>Верификация личности</h2>

        <div className={style.verification__content}>
          {!isVerified && (
            <div className={style.verification__info}>
              <div className={style.verification__info__icon}>
                <Shield />
              </div>
              <div className={style.verification__info__text}>
                <p>
                  Для рассмотрения кредитной заявки необходимо пройти
                  верификацию: сфотографировать паспорт и сделать селфи.
                  Проверка займет меньше минуты.
                </p>
              </div>
            </div>
          )}

          {(error || processingState === "failed") && (
            <div className={style.verification__error}>
              <p>{error || "Верификация не пройдена. Попробуйте ещё раз."}</p>
            </div>
          )}

          <div className={style.verification__actions}>
            {!isVerified && !isFailed && !hasStarted && (
              <button
                className={style.verification__button}
                onClick={handleStart}
                disabled={isLoading || !isMobile}
              >
                {isLoading ? "Подготовка..." : "Пройти верификацию"}
              </button>
            )}

            {!isVerified && !isFailed && hasStarted && (
              <button
                className={style.verification__button}
                onClick={handleStart}
                disabled={isLoading || !isMobile}
              >
                {isLoading ? "Подготовка..." : "Продолжить верификацию"}
              </button>
            )}

            {isFailed && (
              <button
                className={style.verification__button}
                onClick={handleRetry}
                disabled={isLoading || !isMobile}
              >
                {isLoading ? "Подготовка..." : "Повторить верификацию"}
              </button>
            )}

            {isVerified && (
              <div className={style.verification__success}>
                <p>Данные паспорта успешно распознаны и сохранены</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Verification;
