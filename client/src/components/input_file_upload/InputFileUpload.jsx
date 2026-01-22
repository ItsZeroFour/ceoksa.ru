import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import style from "./inputfileupload.module.scss";
import { ReactComponent as Image } from "../../assets/icons/account/image.svg";
import { ReactComponent as Photo } from "../../assets/icons/account/photo.svg";

const InputFileUpload = ({ fileType, onFileSelect, id, fileName }) => {
  const webcamRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCameraModal = () => {
    setIsModalOpen(true);
  };

  const closeCameraModal = () => {
    setIsModalOpen(false);
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      alert("Не удалось сделать снимок.");
      return;
    }

    // Конвертируем data URL в File
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "camera-photo.jpg", {
          type: "image/jpeg",
        });

        if (file.size > 10 * 1024 * 1024) {
          alert("Фото слишком большое. Максимум — 10 МБ.");
          return;
        }

        onFileSelect?.(file);
        closeCameraModal();
      })
      .catch((err) => {
        console.error("Ошибка конвертации:", err);
        alert("Ошибка при создании файла.");
      });
  };

  const handleCameraError = (error) => {
    console.error("Ошибка камеры:", error);
    alert(
      "Камера не найдена или доступ запрещён. Используйте устройство с камерой."
    );
    closeCameraModal();
  };

  return (
    <>
      <div className={style.input_file_upload}>
        <div
          className={style.input_file_upload__main}
          onClick={openCameraModal}
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
            onClick={(e) => {
              e.stopPropagation();
              openCameraModal();
            }}
          >
            <Photo />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className={style.camera_modal_overlay} onClick={closeCameraModal}>
          <div
            className={style.camera_modal}
            onClick={(e) => e.stopPropagation()}
          >
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: "environment", // задняя камера
              }}
              // onUserMediaError={handleCameraError}
              className={style.webcam_preview}
            />

            <div className={style.camera_modal_buttons}>
              <button
                type="button"
                className={style.camera_modal_button_capture}
                onClick={handleCapture}
              >
                Сфотографировать
              </button>
              <button
                type="button"
                className={style.camera_modal_button_cancel}
                onClick={closeCameraModal}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InputFileUpload;
