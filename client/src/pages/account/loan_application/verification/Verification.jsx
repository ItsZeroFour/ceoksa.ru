import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "./verification.module.scss";
import { ReactComponent as Shield } from "../../../../assets/icons/info.svg";
import {
  startVerification,
  fetchCurrentIdentification,
  completeIdentification,
  resetRim,
} from "../../../../redux/slices/rim/rimSlice";
import useIsMobile from "../../../../hooks/useIsMobile";

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
    label: "Обработка данных...",
    color: "#3498db",
    icon: "⏳",
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
    isIframeOpen,
  } = useSelector((state) => state.rim);

  const user = useSelector((state) => state.auth);
  const userRim = user?.user?.data?.rim;
  const isMobile = useIsMobile();
  const wasIframeOpenRef = useRef(false);

  // Когда iframe закрывается — пробуем дозавершить идентификацию.
  // PostMessage от МТС мог не дойти из-за редиректа внутри iframe.
  useEffect(() => {
    if (isIframeOpen) {
      wasIframeOpenRef.current = true;
    } else if (wasIframeOpenRef.current && !isSucceeded) {
      wasIframeOpenRef.current = false;
      // Даём МТС пару секунд на обработку, потом пробуем завершить
      const timer = setTimeout(() => {
        dispatch(completeIdentification());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isIframeOpen, isSucceeded, dispatch]);

  useEffect(() => {
    dispatch(fetchCurrentIdentification()).then((action) => {
      // Если МТС завершил верификацию (callback пришёл), но данные ещё не подтянуты —
      // сразу вызываем completeIdentification для загрузки паспортных данных
      const serverStatus = action.payload?.status;
      if (
        action.payload?.hasIdentification &&
        (serverStatus === "completed" ||
          serverStatus === "personDataCollected") &&
        serverStatus !== "identificationSucceeded"
      ) {
        dispatch(completeIdentification());
      }
    });
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
    currentStatus === "identificationSucceeded" || isSucceeded;

  useEffect(() => {
    if (isSucceeded) {
      window.location.reload();
    }
  }, [isSucceeded]);

  const isFailed =
    currentStatus === "identificationFailed" || currentStatus === "systemError";

  const isPending = !!currentStatus && !isVerified && !isFailed;

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
                disabled={isLoading || !isMobile}
              >
                {isLoading ? "Подготовка..." : "Пройти верификацию"}
              </button>
            )}

            {isPending && (
              <button
                className={style.verification__button}
                onClick={handleStartVerification}
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
