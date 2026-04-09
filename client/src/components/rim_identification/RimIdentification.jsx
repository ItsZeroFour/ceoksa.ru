import React, { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import style from "./rimidentification.module.scss";
import {
  closeIframe,
  completeIdentification,
  fetchIdentificationStatus,
} from "../../redux/slices/rim/rimSlice";

const POLL_INTERVAL = 2000; // Проверяем статус каждые 2 секунды

const RimIdentification = () => {
  const dispatch = useDispatch();
  const iframeRef = useRef(null);
  const completeCalled = useRef(false);

  const { identificationUrl, isIframeOpen, isLoading, status, identificationStatus } = useSelector(
    (state) => state.rim
  );

  const tryComplete = useCallback(() => {
    if (completeCalled.current) return;
    completeCalled.current = true;
    dispatch(completeIdentification());
  }, [dispatch]);

  const handleMessage = useCallback(
    (event) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.app !== "rim") return;

      console.log("[RIM iframe] PostMessage получен:", event.data);

      if (event.data.method === "flowFinished") {
        console.log(
          "[RIM iframe] Сценарий завершён. Контекст:",
          event.data.context
        );

        tryComplete();
      }
    },
    [tryComplete]
  );

  useEffect(() => {
    if (isIframeOpen) {
      window.addEventListener("message", handleMessage);
      completeCalled.current = false;
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [isIframeOpen, handleMessage]);

  // Поллинг статуса — пока iframe открыт, проверяем каждые 5 секунд,
  // не завершилась ли верификация на стороне МТС (через callback)
  useEffect(() => {
    if (!isIframeOpen) return;

    const interval = setInterval(() => {
      dispatch(fetchIdentificationStatus());
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [isIframeOpen, dispatch]);

  // Если поллинг обнаружил что МТС завершил — сразу вызываем complete
  useEffect(() => {
    if (
      isIframeOpen &&
      !completeCalled.current &&
      (identificationStatus === "identificationSucceeded" ||
        identificationStatus === "completed" ||
        identificationStatus === "personDataCollected")
    ) {
      tryComplete();
    }
  }, [isIframeOpen, identificationStatus, tryComplete]);

  useEffect(() => {
    if (isIframeOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isIframeOpen]);

  const handleClose = () => {
    if (isLoading) return;

    // Перед закрытием пробуем завершить — МТС мог уже обработать данные,
    // но postMessage не дошёл из-за редиректа внутри iframe
    if (!completeCalled.current) {
      completeCalled.current = true;
      dispatch(completeIdentification()).finally(() => {
        dispatch(closeIframe());
      });
      return;
    }

    dispatch(closeIframe());
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isIframeOpen || !identificationUrl) return null;

  return (
    <AnimatePresence>
      {isIframeOpen && (
        <motion.div
          className={style.rim_modal}
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={style.rim_modal__wrapper}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className={style.rim_modal__header}>
              <h3>Верификация личности</h3>
              <button
                className={style.rim_modal__close}
                onClick={handleClose}
                disabled={isLoading}
                aria-label="Закрыть"
              />
            </div>

            {isLoading && status === "completing" ? (
              <div className={style.rim_modal__loading}>
                <div className={style.rim_modal__spinner} />
                <p>Обработка результатов...</p>
                <p className={style.rim_modal__loading__sub}>
                  Пожалуйста, подождите. Данные паспорта сохраняются.
                </p>
              </div>
            ) : (
              <div className={style.rim_modal__iframe_container}>
                <iframe
                  ref={iframeRef}
                  src={identificationUrl}
                  title="MTS RIM Идентификация"
                  className={style.rim_modal__iframe}
                  allow="camera; microphone"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RimIdentification;
