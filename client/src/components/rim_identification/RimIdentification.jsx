import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import style from "./rimidentification.module.scss";
import { closeIframe } from "../../redux/slices/rim/rimSlice";

const RimIdentification = () => {
  const dispatch = useDispatch();
  const { identificationUrl, isIframeOpen } = useSelector((state) => state.rim);

  const handleMessage = useCallback(
    (event) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.app !== "rim") return;
      if (event.data.method === "flowFinished") {
        dispatch(closeIframe());
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (!isIframeOpen) return;

    window.addEventListener("message", handleMessage);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("message", handleMessage);
      document.body.style.overflow = "";
    };
  }, [isIframeOpen, handleMessage]);

  const handleClose = () => {
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
                aria-label="Закрыть"
              />
            </div>

            <div className={style.rim_modal__iframe_container}>
              <iframe
                src={identificationUrl}
                title="MTS RIM Идентификация"
                className={style.rim_modal__iframe}
                allow="camera; microphone"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RimIdentification;
