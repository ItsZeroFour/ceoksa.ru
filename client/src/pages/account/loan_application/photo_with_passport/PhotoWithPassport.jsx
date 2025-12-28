import React, { useState } from "react";
import style from "../photo_passport/photopassport.module.scss";
import InputFileUpload from "../../../../components/input_file_upload/InputFileUpload";

const PhotoWithPassport = () => {
  const [passportPhotoFile, setPassportPhotoFile] = useState(null);

  const handleFileSelect = (file) => {
    setPassportPhotoFile(file);
  };

  return (
    <section className={style.photopassport}>
      <div className={style.photopassport__wrappe}>
        <h2>Фотография с паспортом</h2>
        <p>
          Загрузите фотографию, на которой вы изображены с паспортом, раскрытым
          на странице с фотографией. Лицо и данные паспорта должны быть хорошо
          различимы. Запрещено использовать фильтры и редактированные
          изображения.
        </p>

        <ul>
          <li>
            <InputFileUpload
              fileType="Фотография с паспортом"
              onFileSelect={handleFileSelect}
              id="photo-with-passport"
              fileName={passportPhotoFile?.name}
            />
          </li>
        </ul>
      </div>
    </section>
  );
};

export default PhotoWithPassport;
