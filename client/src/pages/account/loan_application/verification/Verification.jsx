import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "./verification.module.scss";
import { ReactComponent as Shield } from "../../../../assets/icons/info.svg";
import {
  startVerification,
  completeIdentification,
  resetRim,
} from "../../../../redux/slices/rim/rimSlice";
import useIsMobile from "../../../../hooks/useIsMobile";

const Verification = () => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();

  const { isLoading, error } = useSelector((state) => state.rim);
  const user = useSelector((state) => state.auth);
  const userRim = user?.user?.data?.rim;

  const savedStatus = userRim?.identificationStatus;
  const isVerified = savedStatus === "identificationSucceeded";
  const isFailed =
    savedStatus === "identificationFailed" || savedStatus === "systemError";
  const hasStarted = !!userRim?.lastRequestGuid;

  const [processingState, setProcessingState] = useState(null);
  const mountCheckDoneRef = useRef(false);

  useEffect(() => {
    if (user.status !== "succeeded") return;
    if (mountCheckDoneRef.current) return;
    if (isVerified || isFailed) return;
    if (!hasStarted) return;

    mountCheckDoneRef.current = true;

    const checkOnce = async () => {
      setProcessingState("checking");
      try {
        const result = await dispatch(completeIdentification()).unwrap();
        if (result.isSucceeded) {
          setProcessingState("succeeded");
          setTimeout(() => window.location.reload(), 500);
          return;
        }
      } catch {}
      setProcessingState(null);
    };

    checkOnce();
  }, [user.status, isVerified, isFailed, hasStarted, dispatch]);

  const handleStart = () => {
    setProcessingState(null);
    dispatch(startVerification());
  };

  const handleRetry = () => {
    setProcessingState(null);
    dispatch(resetRim());
    dispatch(startVerification());
  };

  if (processingState === "checking" || processingState === "succeeded") {
    return (
      <section className={style.verification}>
        <div className={style.verification__wrapper}>
          <h2>Верификация личности</h2>
          <div className={style.verification__content}>
            <div
              className={style.verification__status}
              style={{ borderColor: "#3498db" }}
            >
              <span className={style.verification__status__icon}>
                {processingState === "succeeded" ? "\u2713" : "\u231B"}
              </span>
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
