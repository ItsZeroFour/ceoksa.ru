import React, { useState, useEffect, useRef } from "react";
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
import useIsMobile from "../../../../hooks/useIsMobile";

const PhotoPassport = () => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
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

  const currentUploadKey = useRef(null);
  const isUploadingHere = useRef(false);

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
    if (
      uploadSuccess &&
      uploadedPath &&
      currentUploadKey.current &&
      isUploadingHere.current
    ) {
      const dbKey = keyMapping[currentUploadKey.current];

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
      currentUploadKey.current = null;
      isUploadingHere.current = false;
    }
  }, [
    uploadSuccess,
    uploadedPath,
    dispatch,
    photoPaths,
    user.user.data?.photos,
  ]);

  const handleFileSelect = (key) => async (file) => {
    // if (!isMobile) return;
    if (!file) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) return;

    try {
      setFiles((prev) => ({ ...prev, [key]: file }));
      currentUploadKey.current = key;
      isUploadingHere.current = true;
      dispatch(clearUploadError());
      await dispatch(uploadPhoto(file)).unwrap();
    } catch (error) {
      console.error("Ошибка загрузки фото:", error);
      currentUploadKey.current = null;
      isUploadingHere.current = false;
    }
  };

  const getFileName = (key) => {
    if (files[key]) return files[key].name;
    const dbKey = keyMapping[key];
    if (photoPaths[dbKey]) {
      const pathParts = photoPaths[dbKey].split("/");
      return pathParts[pathParts.length - 1];
    }
    return null;
  };

  const uploadFields = [
    {
      key: "firstSpread",
      label: "Первый разворот паспорта",
      id: "first-spread",
    },
    {
      key: "registration",
      label: "Страница со штампом регистрации",
      id: "registration",
    },
    {
      key: "maritalStatus",
      label: "Страница семейного положения",
      id: "marital-status",
    },
    { key: "children", label: "Страница наличия детей", id: "children" },
    {
      key: "previousPassports",
      label: "Страница ранее выданных паспортах",
      id: "previous-passports",
    },
  ];

  return (
    <section className={style.photopassport}>
      <div className={style.photopassport__wrappe}>
        <h2>Страницы паспорта для рассмотрения заявки</h2>
        <p>
          Для рассмотрения кредитной заявки необходимо загрузить документы,
          удостоверяющие личность. Пожалуйста, прикрепите изображения в хорошем
          качестве — все данные должны быть чётко читаемы.
        </p>

        {!isMobile && (
          <p className={style.photopassport__warning}>
            Загрузка фотографий доступна только с мобильного устройства.
          </p>
        )}

        <ul>
          {uploadFields.map(({ key, label, id }) => (
            <li key={key}>
              <InputFileUpload
                fileType={label}
                onFileSelect={handleFileSelect(key)}
                id={id}
                fileName={getFileName(key)}
                // disabled={
                //   !isMobile || (uploading && currentUploadKey.current === key)
                // }
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default PhotoPassport;
