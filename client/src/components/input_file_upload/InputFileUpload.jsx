import React, { useRef } from "react";
import style from "./inputfileupload.module.scss";
import { ReactComponent as Image } from "../../assets/icons/account/image.svg";
import { ReactComponent as Photo } from "../../assets/icons/account/photo.svg";

const InputFileUpload = ({ fileType, onFileSelect, id, fileName }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleCaptureClick = async () => {
    let stream = null;
    try {
      const constraints = { video: { facingMode: "environment" } };
      stream = await navigator.mediaDevices.getUserMedia(constraints);

      const video = videoRef.current;
      video.srcObject = stream;

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );

      if (!blob) {
        throw new Error("Не удалось создать изображение");
      }

      const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });

      if (file.size > 10 * 1024 * 1024) {
        alert("Фото слишком большое. Максимум — 10 МБ.");
        return;
      }

      onFileSelect?.(file);
    } catch (err) {
      console.error("Ошибка захвата с камеры:", err);
      alert(
        "Камера не найдена или доступ запрещён. Используйте устройство с камерой и разрешите доступ."
      );
    } finally {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  return (
    <div className={style.input_file_upload}>
      <div style={{ display: "none" }}>
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} />
      </div>

      <div
        className={style.input_file_upload__main}
        onClick={handleCaptureClick}
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
            handleCaptureClick();
          }}
        >
          <Photo />
        </div>
      </div>
    </div>
  );
};

export default InputFileUpload;
