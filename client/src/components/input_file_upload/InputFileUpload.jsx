import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import style from "./inputfileupload.module.scss";
import { ReactComponent as Image } from "../../assets/icons/account/image.svg";
import { ReactComponent as Photo } from "../../assets/icons/account/photo.svg";
import {
  overlayVariants,
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
  const frameRef = useRef(null);
  const viewfinderRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      document.body.style.overflow = "hidden";
    }
  };

  const closeCameraModal = () => {
    setIsModalOpen(false);
    setCapturedImage(null);
    document.body.style.overflow = "";
  };

  const handleCapture = () => {
    const video = webcamRef.current?.video;
    const frame = frameRef.current;
    const viewfinder = viewfinderRef.current;

    if (!video || !frame || !viewfinder) {
      alert("Не удалось сделать снимок.");
      return;
    }

    const vfRect = viewfinder.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();

    // Рассчитываем позицию рамки относительно viewfinder
    const relX = (frameRect.left - vfRect.left) / vfRect.width;
    const relY = (frameRect.top - vfRect.top) / vfRect.height;
    const relW = frameRect.width / vfRect.width;
    const relH = frameRect.height / vfRect.height;

    // Видео может быть обрезано из-за object-fit: cover
    const videoW = video.videoWidth;
    const videoH = video.videoHeight;
    const vfAspect = vfRect.width / vfRect.height;
    const vidAspect = videoW / videoH;

    let srcX, srcY, srcW, srcH;

    if (vidAspect > vfAspect) {
      // Видео шире — обрезаны бока
      const visibleW = videoH * vfAspect;
      const offsetX = (videoW - visibleW) / 2;
      srcX = offsetX + relX * visibleW;
      srcY = relY * videoH;
      srcW = relW * visibleW;
      srcH = relH * videoH;
    } else {
      // Видео выше — обрезан верх/низ
      const visibleH = videoW / vfAspect;
      const offsetY = (videoH - visibleH) / 2;
      srcX = relX * videoW;
      srcY = offsetY + relY * visibleH;
      srcW = relW * videoW;
      srcH = relH * visibleH;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(srcW);
    canvas.height = Math.round(srcH);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      video,
      Math.round(srcX),
      Math.round(srcY),
      Math.round(srcW),
      Math.round(srcH),
      0,
      0,
      canvas.width,
      canvas.height
    );

    const croppedImage = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(croppedImage);
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
              {/* Top bar — close button only (RIM has "Верификация личности" here, we skip text) */}
              <div className={style.camera_modal__topbar}>
                <div />
                <button
                  type="button"
                  className={style.camera_modal__close_btn}
                  onClick={closeCameraModal}
                >
                  ✕
                </button>
              </div>

              {/* Camera area — everything else is inside here */}
              <div className={style.camera_modal__viewfinder} ref={viewfinderRef}>
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Сделанное фото"
                    className={style.captured_preview}
                  />
                ) : (
                  <>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "environment" }}
                      onUserMediaError={handleCameraError}
                      className={style.webcam_preview}
                    />

                    {/* Blurred dark overlay with rounded cutout */}
                    <div className={style.overlay_blur} />

                    {/* Frame corners + glow */}
                    <div className={style.overlay__frame} ref={frameRef}>
                      {/* Top-left */}
                      <svg className={style.corner_tl} viewBox="0 0 77 77" fill="none">
                        <path d="M 74 3.5 L 17 3.5 Q 3.5 3.5 3.5 17 L 3.5 74" stroke="rgba(255,255,255,0.92)" strokeWidth="7" strokeLinecap="round" />
                      </svg>
                      {/* Top-right */}
                      <svg className={style.corner_tr} viewBox="0 0 77 77" fill="none">
                        <path d="M 3 3.5 L 60 3.5 Q 73.5 3.5 73.5 17 L 73.5 74" stroke="rgba(255,255,255,0.92)" strokeWidth="7" strokeLinecap="round" />
                      </svg>
                      {/* Bottom-left */}
                      <svg className={style.corner_bl} viewBox="0 0 77 77" fill="none">
                        <path d="M 3.5 3 L 3.5 60 Q 3.5 73.5 17 73.5 L 74 73.5" stroke="rgba(255,255,255,0.92)" strokeWidth="7" strokeLinecap="round" />
                      </svg>
                      {/* Bottom-right */}
                      <svg className={style.corner_br} viewBox="0 0 77 77" fill="none">
                        <path d="M 73.5 3 L 73.5 60 Q 73.5 73.5 60 73.5 L 3 73.5" stroke="rgba(255,255,255,0.92)" strokeWidth="7" strokeLinecap="round" />
                      </svg>
                    </div>

                    {/* Text over top dark zone */}
                    <div className={style.overlay__top}>
                      <h3 className={style.overlay__title}>Фото паспорта</h3>
                      <p className={style.overlay__subtitle}>
                        Соедините углы документа с уголками на{"\u00A0"}экране
                      </p>
                    </div>

                    {/* Button over bottom dark zone */}
                    <div className={style.overlay__bottom}>
                      <button
                        type="button"
                        className={style.overlay__capture_btn}
                        onClick={handleCapture}
                      >
                        СДЕЛАТЬ ФОТО
                      </button>
                    </div>
                  </>
                )}

                {/* Confirm/retake controls over captured image */}
                {capturedImage && (
                  <div className={style.overlay__confirm}>
                    <div className={style.overlay__confirm_row}>
                      <button
                        type="button"
                        className={style.overlay__retake_btn}
                        onClick={handleRetake}
                      >
                        Переснять
                      </button>
                      <button
                        type="button"
                        className={style.overlay__use_btn}
                        onClick={handleConfirm}
                      >
                        Использовать
                      </button>
                    </div>
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
