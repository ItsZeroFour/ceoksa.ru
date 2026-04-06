import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "./verification.module.scss";
import { ReactComponent as Shield } from "../../../../assets/icons/info.svg";
import {
  startVerification,
  fetchCurrentIdentification,
  resetRim,
} from "../../../../redux/slices/rim/rimSlice";

const STATUS_MAP = {
  identificationSucceeded: {
    label: "Верификация пройдена",
    color: "#27ae60",
    icon: "✓",
  },
  identificationFailed: {
    label: "Верификация не пройдена",
    color: "#e74c3c",
    icon: "✕",
  },
  systemError: {
    label: "Системная ошибка",
    color: "#e74c3c",
    icon: "!",
  },
  personDataCollected: {
    label: "Данные получены, идёт проверка",
    color: "#f39c12",
    icon: "⏳",
  },
  linkCreated: {
    label: "Ожидает прохождения",
    color: "#3498db",
    icon: "→",
  },
  completed: {
    label: "Верификация завершена",
    color: "#27ae60",
    icon: "✓",
  },
};

const Verification = () => {
  const dispatch = useDispatch();
  const {
    status: rimStatus,
    identificationStatus,
    isLoading,
    error,
    isSucceeded,
  } = useSelector((state) => state.rim);

  const user = useSelector((state) => state.auth);
  const userRim = user?.user?.data?.rim;

  useEffect(() => {
    dispatch(fetchCurrentIdentification());
  }, [dispatch]);

  const handleStartVerification = () => {
    dispatch(startVerification());
  };

  const handleRetry = () => {
    dispatch(resetRim());
    dispatch(startVerification());
  };

  const currentStatus =
    identificationStatus || userRim?.identificationStatus || null;
  const statusInfo = currentStatus ? STATUS_MAP[currentStatus] : null;

  const isVerified =
    currentStatus === "identificationSucceeded" ||
    currentStatus === "completed" ||
    isSucceeded;

  useEffect(() => {
    if (isSucceeded) {
      window.location.reload();
    }
  }, [isSucceeded]);

  const isFailed =
    currentStatus === "identificationFailed" || currentStatus === "systemError";

  const isPending =
    currentStatus === "linkCreated" || currentStatus === "personDataCollected";

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

          {statusInfo && (
            <div
              className={style.verification__status}
              style={{ borderColor: statusInfo.color }}
            >
              <span
                className={style.verification__status__icon}
                // style={{ background: statusInfo.color }}
              >
                {statusInfo.icon}
              </span>
              <span className={style.verification__status__text}>
                {statusInfo.label}
              </span>
            </div>
          )}

          {error && (
            <div className={style.verification__error}>
              <p>{error}</p>
            </div>
          )}

          <div className={style.verification__actions}>
            {!currentStatus && (
              <button
                className={style.verification__button}
                onClick={handleStartVerification}
                disabled={isLoading}
              >
                {isLoading ? "Подготовка..." : "Пройти верификацию"}
              </button>
            )}

            {isPending && (
              <button
                className={style.verification__button}
                onClick={handleStartVerification}
                disabled={isLoading}
              >
                {isLoading ? "Подготовка..." : "Продолжить верификацию"}
              </button>
            )}

            {isFailed && (
              <button
                className={style.verification__button}
                onClick={handleRetry}
                disabled={isLoading}
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
