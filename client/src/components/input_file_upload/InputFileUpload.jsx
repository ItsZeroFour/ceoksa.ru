import React, { useRef } from "react";
import style from "./inputfileupload.module.scss";
import { ReactComponent as Image } from "../../assets/icons/account/image.svg";
import { ReactComponent as Upload } from "../../assets/icons/account/upload.svg";

const InputFileUpload = ({ fileType, onFileSelect, id, fileName }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      alert("Неверный формат. Разрешены: JPG, PNG, PDF.");
      return;
    }

    if (file.size > maxSize) {
      alert("Файл слишком большой. Максимум — 10 МБ.");
      return;
    }

    onFileSelect?.(file);
  };

  return (
    <div className={style.input_file_upload}>
      <input
        type="file"
        id={`file-${id}`}
        hidden
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      <label htmlFor={`file-${id}`}>
        <div className={style.input_file_upload__main}>
          <div className={style.input_file_upload__icon}>
            <Image />
          </div>

          <div className={style.input_file_upload__text}>
            <p>{fileType}</p>
            <p>
              {!fileName
                ? "Загрузите фото документа"
                : fileName.length > 25
                ? `${fileName.slice(0, 25)}...`
                : fileName}
            </p>
          </div>
        </div>

        <div className={style.input_file_upload__upload}>
          <Upload />
        </div>
      </label>

      <p>
        Файлы в формате JPG, PNG или PDF. <br /> Размер одного файла — до 10 МБ.
      </p>
    </div>
  );
};

export default InputFileUpload;
