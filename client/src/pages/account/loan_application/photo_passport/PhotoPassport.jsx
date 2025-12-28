import React, { useState } from "react";
import style from "./photopassport.module.scss";
import InputFileUpload from "../../../../components/input_file_upload/InputFileUpload";

const PhotoPassport = () => {
  const [files, setFiles] = useState({
    firstSpread: null,
    registration: null,
    maritalStatus: null,
    children: null,
    previousPassports: null,
  });

  const handleFileSelect = (key) => (file) => {
    setFiles((prev) => ({
      ...prev,
      [key]: file,
    }));
    console.log(`Файл для "${key}" выбран:`, file.name);
  };

  return (
    <section className={style.photopassport}>
      <div className={style.photopassport__wrappe}>
        <h2>Страницы паспорта для рассмотрения заявки</h2>
        <p>
          Для рассмотрения кредитной заявки необходимо загрузить документы,
          удостоверяющие личность.Пожалуйста, прикрепите изображения в хорошем
          качестве — все данные должны быть чётко читаемы.
        </p>

        <ul>
          <li>
            <InputFileUpload
              fileType="Первый разворот паспорта"
              onFileSelect={handleFileSelect("firstSpread")}
              id="first-spread"
              fileName={files.firstSpread?.name}
            />
          </li>

          <li>
            <InputFileUpload
              fileType="Страница со штампом регистрации"
              onFileSelect={handleFileSelect("registration")}
              id="registration"
              fileName={files.registration?.name}
            />
          </li>

          <li>
            <InputFileUpload
              fileType="Страница семейного положения"
              onFileSelect={handleFileSelect("maritalStatus")}
              id="marital-status"
              fileName={files.maritalStatus?.name}
            />
          </li>

          <li>
            <InputFileUpload
              fileType="Страница наличия детей"
              onFileSelect={handleFileSelect("children")}
              id="children"
              fileName={files.children?.name}
            />
          </li>

          <li>
            <InputFileUpload
              fileType="Страница ранее выданных паспортах"
              onFileSelect={handleFileSelect("previousPassports")}
              id="previous-passports"
              fileName={files.previousPassports?.name}
            />
          </li>
        </ul>
      </div>
    </section>
  );
};

export default PhotoPassport;
