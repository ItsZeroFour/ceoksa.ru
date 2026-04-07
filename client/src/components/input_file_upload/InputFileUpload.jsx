import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import style from "./inputfileupload.module.scss";
import { ReactComponent as Image } from "../../assets/icons/account/image.svg";
import { ReactComponent as Photo } from "../../assets/icons/account/photo.svg";
import { ReactComponent as Rotate } from "../../assets/icons/rotate.svg";
import {
  overlayVariants,
  modalTransition,
} from "../../animations/camera-modal-аnimations";
import { motion, AnimatePresence } from "framer-motion";
import { useScreenWidth } from "../../hooks/useScreenWidth";

const InputFileUpload = ({
  fileType,
  onFileSelect,
  id,
  fileName,
  disabled,
}) => {
  const webcamRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [capturedImage, setCapturedImage] = useState(null);

  const fileInputRef = useRef(null);
  const [currentFileName, setCurrentFileName] = useState(fileName || "");

  const screenWidth = useScreenWidth();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Фото слишком большое. Максимум — 10 МБ.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
      alert("Разрешены только JPG и PNG.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const randomString = Math.random().toString(36).substring(2, 12);
    const extension = file.type === "image/jpeg" ? "jpg" : "png";
    const newFileName = `photo-${randomString}.${extension}`;

    const renamedFile = new File([file], newFileName, { type: file.type });

    onFileSelect?.(renamedFile);

    setCurrentFileName(newFileName);
  };

  const openCameraModal = () => {
    if (screenWidth < 800) {
      setIsModalOpen(true);
      setCapturedImage(null);
    }
  };

  const closeCameraModal = () => {
    setIsModalOpen(false);
    setCapturedImage(null);
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      alert("Не удалось сделать снимок.");
      return;
    }
    setCapturedImage(imageSrc);
  };

  const handleConfirm = () => {
    if (!capturedImage) return;

    fetch(capturedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const randomString = Math.random().toString(36).substring(2, 12);
        const file = new File([blob], `camera-photo-${randomString}.jpg`, {
          type: "image/jpeg",
        });

        if (file.size > 10 * 1024 * 1024) {
          alert("Фото слишком большое. Максимум — 10 МБ.");
          return;
        }

        onFileSelect?.(file);
        setCurrentFileName(file.name);
        closeCameraModal();
      })
      .catch((err) => {
        console.error("Ошибка конвертации:", err);
        alert("Ошибка при создании файла.");
      });
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const toggleCamera = () => {
    setFacingMode((prevMode) =>
      prevMode === "environment" ? "user" : "environment"
    );
  };

  const handleCameraError = (error) => {
    console.error("Ошибка камеры:", error);
    alert(
      "Камера не найдена или доступ запрещён. Используйте устройство с камерой."
    );
    closeCameraModal();
  };

  const handleClick = (e) => {
    if (screenWidth < 800) {
      e.preventDefault();
      openCameraModal();
    }
  };

  return (
    <>
      <input
        type="file"
        id={`file-${id}`}
        hidden
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        disabled={disabled || false}
        ref={fileInputRef}
      />

      <div className={style.input_file_upload}>
        <label
          htmlFor={screenWidth >= 800 ? `file-${id}` : undefined}
          className={style.input_file_upload__main}
          onClick={handleClick}
        >
          <div className={style.input_file_upload__text__container}>
            <div className={style.input_file_upload__icon}>
              <Image />
            </div>
            <div className={style.input_file_upload__text}>
              <p>{fileType}</p>
              <p>
                {!fileName
                  ? "Сделайте фото документа"
                  : fileName.length > 25
                  ? `${fileName.slice(0, 25)}...`
                  : fileName}
              </p>
            </div>
          </div>

          <div className={style.input_file_upload__upload}>
            <Photo />
          </div>
        </label>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className={style.camera_modal_overlay}
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div
              className={style.camera_modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={style.camera_modal__header}>
                <h3>Фото паспорта</h3>
                <p>Соедините углы документа с уголками на экране</p>
              </div>

              <div className={style.camera_modal__viewfinder}>
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Сделанное фото"
                    className={style.captured_preview}
                  />
                ) : (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode }}
                    onUserMediaError={handleCameraError}
                    className={style.webcam_preview}
                  />
                )}

                {!capturedImage && (
                  <div className={style.camera_modal__frame}>
                    <div className={style.corner_tl} />
                    <div className={style.corner_tr} />
                    <div className={style.corner_bl} />
                    <div className={style.corner_br} />
                  </div>
                )}
              </div>

              <div className={style.camera_modal__controls}>
                {!capturedImage ? (
                  <>
                    <button
                      type="button"
                      className={style.camera_modal__capture_btn}
                      onClick={handleCapture}
                    >
                      СДЕЛАТЬ ФОТО
                    </button>
                    <div className={style.camera_modal__bottom_row}>
                      <button
                        type="button"
                        className={style.camera_modal__cancel_btn}
                        onClick={closeCameraModal}
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        className={style.camera_modal__rotate_btn}
                        onClick={toggleCamera}
                      >
                        <Rotate />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={style.camera_modal__confirm_row}>
                    <button
                      type="button"
                      className={style.camera_modal__retake_btn}
                      onClick={handleRetake}
                    >
                      Переснять
                    </button>
                    <button
                      type="button"
                      className={style.camera_modal__use_btn}
                      onClick={handleConfirm}
                    >
                      Использовать фото
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InputFileUpload;
