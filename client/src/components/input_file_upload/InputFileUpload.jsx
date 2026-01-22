import React, { useRef, useState } from "react";
import style from "./inputfileupload.module.scss";
import { ReactComponent as Image } from "../../assets/icons/account/image.svg";
import { ReactComponent as Photo } from "../../assets/icons/account/photo.svg";

const InputFileUpload = ({ fileType, onFileSelect, id, fileName }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCaptureClick = async () => {
    let stream = null;

    try {
      const constraints = { video: { facingMode: "environment" } };
      stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = resolve;
        });
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );

      if (!blob) {
        alert("Не удалось создать изображение.");
        return;
      }

      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

      const maxSize = 10 * 1024 * 1024; // 10 МБ
      if (file.size > maxSize) {
        alert("Снимок слишком большой. Максимум — 10 МБ.");
        return;
      }

      onFileSelect?.(file);
    } catch (err) {
      console.error("Ошибка доступа к камере:", err);
      alert(
        "Камера не найдена или доступ запрещён. Убедитесь, что вы используете устройство с камерой и разрешили доступ."
      );
    } finally {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsCapturing(false);
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
          onClick={handleCaptureClick}
        >
          <Photo />
        </div>
      </div>
    </div>
  );
};

export default InputFileUpload;
