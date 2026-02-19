import React, { useRef, useState } from "react";
// import Webcam from "react-webcam";
import style from "./inputfileupload.module.scss";
import { ReactComponent as Image } from "../../assets/icons/account/image.svg";
import { ReactComponent as Photo } from "../../assets/icons/account/photo.svg";
// import { ReactComponent as Rotate } from "../../assets/icons/rotate.svg";
// import { ReactComponent as Angle } from "../../assets/icons/angle.svg";
// import {
//   overlayVariants,
//   modalVariants,
//   modalTransition,
// } from "../../animations/camera-modal-аnimations";
// import { motion, AnimatePresence } from "framer-motion";
import useDisableScroll from "../../hooks/useDisableScroll";
// import { useScreenWidth } from "../../hooks/useScreenWidth";

const InputFileUpload = ({
  fileType,
  onFileSelect,
  id,
  fileName,
  disabled,
}) => {
  // const webcamRef = useRef(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [facingMode, setFacingMode] = useState("environment");
  // const [startY, setStartY] = useState(0);
  // const [isSwiping, setIsSwiping] = useState(false);
  // const [capturedImage, setCapturedImage] = useState(null);

  const fileInputRef = useRef(null);
  const [currentFileName, setCurrentFileName] = useState(fileName || "");

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

  // const screenWidth = useScreenWidth();

  // const openCameraModal = () => {
  //   if (screenWidth < 800) {
  //     setIsModalOpen(true);
  //     setCapturedImage(null);
  //   }
  // };

  // const closeCameraModal = () => {
  //   if (screenWidth < 800) {
  //     setIsModalOpen(false);
  //     setCapturedImage(null);
  //   }
  // };

  // const handleCapture = () => {
  //   const imageSrc = webcamRef.current?.getScreenshot();
  //   if (!imageSrc) {
  //     alert("Не удалось сделать снимок.");
  //     return;
  //   }

  //   setCapturedImage(imageSrc);

  //   // fetch(imageSrc)
  //   //   .then((res) => res.blob())
  //   //   .then((blob) => {
  //   //     const randomString = Math.random().toString(36).substring(2, 12);
  //   //     const file = new File([blob], `camera-photo-${randomString}.jpg`, {
  //   //       type: "image/jpeg",
  //   //     });

  //   //     if (file.size > 10 * 1024 * 1024) {
  //   //       alert("Фото слишком большое. Максимум — 10 МБ.");
  //   //       return;
  //   //     }

  //   //     onFileSelect?.(file);
  //   //     closeCameraModal();
  //   //   })
  //   //   .catch((err) => {
  //   //     console.error("Ошибка конвертации:", err);
  //   //     alert("Ошибка при создании файла.");
  //   //   });
  // };

  // const handleConfirm = () => {
  //   if (!capturedImage) return;

  //   fetch(capturedImage)
  //     .then((res) => res.blob())
  //     .then((blob) => {
  //       const randomString = Math.random().toString(36).substring(2, 12);
  //       const file = new File([blob], `camera-photo-${randomString}.jpg`, {
  //         type: "image/jpeg",
  //       });

  //       if (file.size > 10 * 1024 * 1024) {
  //         alert("Фото слишком большое. Максимум — 10 МБ.");
  //         return;
  //       }

  //       onFileSelect?.(file);
  //       closeCameraModal();
  //     })
  //     .catch((err) => {
  //       console.error("Ошибка конвертации:", err);
  //       alert("Ошибка при создании файла.");
  //     });
  // };

  // const handleRetake = () => {
  //   setCapturedImage(null);
  // };

  // const toggleCamera = () => {
  //   setFacingMode((prevMode) =>
  //     prevMode === "environment" ? "user" : "environment"
  //   );
  // };

  // const handleCameraError = (error) => {
  //   console.error("Ошибка камеры:", error);
  //   alert(
  //     "Камера не найдена или доступ запрещён. Используйте устройство с камерой."
  //   );
  //   closeCameraModal();
  // };

  // const handleTouchStart = (e) => {
  //   setStartY(e.touches[0].clientY);
  //   setIsSwiping(true);
  // };

  // const handleTouchEnd = (e) => {
  //   if (!isSwiping) return;

  //   const endY = e.changedTouches[0].clientY;
  //   const diff = endY - startY;

  //   if (diff > 50) {
  //     closeCameraModal();
  //   }

  //   setIsSwiping(false);
  // };

  // const handleMouseDown = (e) => {
  //   const startYMouse = e.clientY;

  //   const handleMouseMove = (moveEvent) => {
  //     const diff = moveEvent.clientY - startYMouse;
  //     if (diff > 50) {
  //       closeCameraModal();
  //       cleanup();
  //     }
  //   };

  //   const handleMouseUp = () => cleanup();

  //   const cleanup = () => {
  //     window.removeEventListener("mousemove", handleMouseMove);
  //     window.removeEventListener("mouseup", handleMouseUp);
  //   };

  //   window.addEventListener("mousemove", handleMouseMove);
  //   window.addEventListener("mouseup", handleMouseUp);
  // };

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
      />

      <div className={style.input_file_upload}>
        <label
          htmlFor={`file-${id}`}
          className={style.input_file_upload__main}
          // onClick={openCameraModal}
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

          <div
            className={style.input_file_upload__upload}
            // onClick={(e) => {
            //   e.stopPropagation();
            //   openCameraModal();
            // }}
          >
            <Photo />
          </div>
        </label>
      </div>

      {/* <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className={style.camera_modal_overlay}
            onClick={closeCameraModal}
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div
              className={style.camera_modal}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className={style.camera_modal__top}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={modalTransition}
              >
                <button type="button" onClick={closeCameraModal}>
                  <Angle /> Отмена
                </button>
                <h3>Фото</h3>
                <div></div>
              </motion.div>

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

              <div
                className={style.webcam_nav}
                style={{ paddingBottom: `${safeAreaBottom}px` }}
              >
                {!capturedImage ? (
                  <div className={style.webcam_nav__container}>
                    <div></div>

                    <div className={style.webcam_nav__photo}>
                      <button type="button" onClick={handleCapture}></button>
                    </div>

                    <div
                      className={style.webcam_nav__photo__rotate}
                      type="button"
                      onClick={toggleCamera}
                    >
                      <button>
                        <Rotate />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={style.webcam_nav__container}>
                    <button
                      className={style.webcam_nav__container__captured}
                      type="button"
                      onClick={handleRetake}
                    >
                      Переснять
                    </button>
                    <button
                      className={style.webcam_nav__container__captured}
                      type="button"
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
      </AnimatePresence> */}
    </>
  );
};

export default InputFileUpload;
