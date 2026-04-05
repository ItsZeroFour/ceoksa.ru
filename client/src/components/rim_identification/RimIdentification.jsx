import React, { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import style from "./rimidentification.module.scss";
import {
  closeIframe,
  completeIdentification,
} from "../../redux/slices/rim/rimSlice";

const RimIdentification = () => {
  const dispatch = useDispatch();
  const iframeRef = useRef(null);

  const { identificationUrl, isIframeOpen, isLoading, status } = useSelector(
    (state) => state.rim
  );

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

        dispatch(completeIdentification());
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (isIframeOpen) {
      window.addEventListener("message", handleMessage);
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [isIframeOpen, handleMessage]);

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
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
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
