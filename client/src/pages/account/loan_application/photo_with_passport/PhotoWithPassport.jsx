import React, { useState, useEffect } from "react";
import style from "../photo_passport/photopassport.module.scss";
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

const PhotoWithPassport = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth);
  const {
    uploadedPath,
    uploading,
    error: uploadError,
    uploadSuccess,
  } = useSelector((state) => state.upload);

  const [passportPhotoFile, setPassportPhotoFile] = useState(null);
  const [photoPath, setPhotoPath] = useState("");
  const [isUploadingHere, setIsUploadingHere] = useState(false);

  useEffect(() => {
    if (
      user.status === "succeeded" &&
      user.user.data?.photos?.photo_with_passport
    ) {
      setPhotoPath(user.user.data.photos.photo_with_passport);
    }
  }, [user]);

  useEffect(() => {
    if (uploadSuccess && uploadedPath && isUploadingHere) {
      setPhotoPath(uploadedPath);

      dispatch(clearError());
      dispatch(
        updateUser({
          photos: {
            ...user.user.data?.photos,
            photo_with_passport: uploadedPath,
          },
        })
      );

      dispatch(resetUpload());
      setIsUploadingHere(false);
    }
  }, [
    uploadSuccess,
    uploadedPath,
    isUploadingHere,
    dispatch,
    user.user.data?.photos,
  ]);

  const handleFileSelect = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      // alert("Пожалуйста, загрузите изображение");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // alert("Размер файла не должен превышать 10MB");
      return;
    }

    try {
      setPassportPhotoFile(file);
      setIsUploadingHere(true);
      dispatch(clearUploadError());
      await dispatch(uploadPhoto(file)).unwrap();

      console.log("Фото с паспортом успешно загружено");
    } catch (error) {
      console.error("Ошибка загрузки фото:", error);
      // alert("Ошибка при загрузке фотографии");
      setIsUploadingHere(false);
    }
  };

  const getFileName = () => {
    if (passportPhotoFile) {
      return passportPhotoFile.name;
    }

    if (photoPath) {
      const pathParts = photoPath.split("/");
      return pathParts[pathParts.length - 1];
    }

    return null;
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
              fileName={getFileName()}
              disabled={uploading}
            />
          </li>
        </ul>
      </div>
    </section>
  );
};

export default PhotoWithPassport;
