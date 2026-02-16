import React, { useState, useEffect } from "react";
import style from "./photopassport.module.scss";
import InputFileUpload from "../../../../components/input_file_upload/InputFileUpload";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadPhoto,
  clearUploadError,
  resetUpload,
} from "../../../../redux/slices/user/uploadSlice";
import {
  updateUser,
  clearError,
} from "../../../../redux/slices/user/updateUserSlice";

const PhotoPassport = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth);
  const {
    uploadedPath,
    uploading,
    error: uploadError,
    uploadSuccess,
  } = useSelector((state) => state.upload);

  const [files, setFiles] = useState({
    firstSpread: null,
    registration: null,
    maritalStatus: null,
    children: null,
    previousPassports: null,
  });

  const [photoPaths, setPhotoPaths] = useState({
    first_page_of_the_passport: "",
    page_with_registration_stamp: "",
    marital_status_page: "",
    children_availability_page: "",
    previously_issued_passports_page: "",
  });

  const [currentUploadKey, setCurrentUploadKey] = useState(null);
  const [isUploadingHere, setIsUploadingHere] = useState(false);

  const keyMapping = {
    firstSpread: "first_page_of_the_passport",
    registration: "page_with_registration_stamp",
    maritalStatus: "marital_status_page",
    children: "children_availability_page",
    previousPassports: "previously_issued_passports_page",
  };

  useEffect(() => {
    if (user.status === "succeeded" && user.user.data?.photos) {
      setPhotoPaths({
        first_page_of_the_passport:
          user.user.data.photos.first_page_of_the_passport || "",
        page_with_registration_stamp:
          user.user.data.photos.page_with_registration_stamp || "",
        marital_status_page: user.user.data.photos.marital_status_page || "",
        children_availability_page:
          user.user.data.photos.children_availability_page || "",
        previously_issued_passports_page:
          user.user.data.photos.previously_issued_passports_page || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (uploadSuccess && uploadedPath && currentUploadKey && isUploadingHere) {
      const dbKey = keyMapping[currentUploadKey];

      const newPhotoPaths = {
        ...photoPaths,
        [dbKey]: uploadedPath,
      };

      setPhotoPaths(newPhotoPaths);

      dispatch(clearError());
      dispatch(
        updateUser({
          photos: {
            ...user.user.data?.photos,
            ...newPhotoPaths,
          },
        })
      );

      dispatch(resetUpload());
      setCurrentUploadKey(null);
      setIsUploadingHere(false);
    }
  }, [uploadSuccess, uploadedPath, currentUploadKey, isUploadingHere, dispatch, photoPaths, user.user.data?.photos]);

  const handleFileSelect = (key) => async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, загрузите изображение");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Размер файла не должен превышать 10MB");
      return;
    }

    try {
      setFiles((prev) => ({
        ...prev,
        [key]: file,
      }));

      setCurrentUploadKey(key);
      setIsUploadingHere(true);
      dispatch(clearUploadError());
      await dispatch(uploadPhoto(file)).unwrap();

      console.log(`Файл для "${key}" успешно загружен`);
    } catch (error) {
      console.error("Ошибка загрузки фото:", error);
      alert("Ошибка при загрузке фотографии");
      setCurrentUploadKey(null);
      setIsUploadingHere(false);
    }
  };

  const getFileName = (key) => {
    if (files[key]) {
      return files[key].name;
    }

    const dbKey = keyMapping[key];
    if (photoPaths[dbKey]) {
      const pathParts = photoPaths[dbKey].split("/");
      return pathParts[pathParts.length - 1];
    }

    return null;
  };

  return (
    <section className={style.photopassport}>
      <div className={style.photopassport__wrappe}>
        <h2>Страницы паспорта для рассмотрения заявки</h2>
        <p>
          Для рассмотрения кредитной заявки необходимо загрузить документы,
          удостоверяющие личность. Пожалуйста, прикрепите изображения в хорошем
          качестве — все данные должны быть чётко читаемы.
        </p>

        <ul>
          <li>
            <InputFileUpload
              fileType="Первый разворот паспорта"
              onFileSelect={handleFileSelect("firstSpread")}
              id="first-spread"
              fileName={getFileName("firstSpread")}
              disabled={uploading && currentUploadKey === "firstSpread"}
            />
          </li>

          <li>
            <InputFileUpload
              fileType="Страница со штампом регистрации"
              onFileSelect={handleFileSelect("registration")}
              id="registration"
              fileName={getFileName("registration")}
              disabled={uploading && currentUploadKey === "registration"}
            />
          </li>

          <li>
            <InputFileUpload
              fileType="Страница семейного положения"
              onFileSelect={handleFileSelect("maritalStatus")}
              id="marital-status"
              fileName={getFileName("maritalStatus")}
              disabled={uploading && currentUploadKey === "maritalStatus"}
            />
          </li>

          <li>
            <InputFileUpload
              fileType="Страница наличия детей"
              onFileSelect={handleFileSelect("children")}
              id="children"
              fileName={getFileName("children")}
              disabled={uploading && currentUploadKey === "children"}
            />
          </li>

          <li>
            <InputFileUpload
              fileType="Страница ранее выданных паспортах"
              onFileSelect={handleFileSelect("previousPassports")}
              id="previous-passports"
              fileName={getFileName("previousPassports")}
              disabled={uploading && currentUploadKey === "previousPassports"}
            />
          </li>
        </ul>
      </div>
    </section>
  );
};

export default PhotoPassport;