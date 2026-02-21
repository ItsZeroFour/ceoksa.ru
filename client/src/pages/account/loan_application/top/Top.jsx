import React, { useEffect, useRef, useState } from "react";
import style from "./top.module.scss";
import Notification from "../../../../components/notification/Notification";
import camera from "../../../../assets/icons/account/camera.svg";
import InputField from "../../../../components/input_field/InputField";
import { useScreenWidth } from "../../../../hooks/useScreenWidth";
import { useDebouncedUpdate } from "../../../../hooks/useDebouncedUpdate";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUser,
  clearError,
  clearUpdateSuccess,
} from "../../../../redux/slices/user/updateUserSlice";
import {
  uploadPhoto,
  clearUploadError,
  resetUpload,
} from "../../../../redux/slices/user/uploadSlice";
import { patchUser } from "../../../../redux/slices/auth/authSlice";

const Top = () => {
  const dispatch = useDispatch();
  const { currentUser, loading, error, updateSuccess } = useSelector(
    (state) => state.updateUser
  );
  const user = useSelector((state) => state.auth);
  const initialized = useRef(false);

  const {
    uploadedPath,
    uploading,
    error: uploadError,
    uploadSuccess,
  } = useSelector((state) => state.upload);

  const [formData, setFormData] = useState({
    fullName: "",
    profilePhoto: "",
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploadingHere, setIsUploadingHere] = useState(false);

  const screenWidth = useScreenWidth();

  const debouncedUpdate = useDebouncedUpdate((data) => {
    dispatch(clearError());
    dispatch(updateUser(data));
  }, 3000);

  useEffect(() => {
    if (!initialized.current && user.status === "succeeded" && user.user.data) {
      setFormData({
        fullName: user.user.data.fullName || "",
        profilePhoto: user.user.data.profilePhoto || "",
      });
      if (user.user.data.profilePhoto) {
        setPhotoPreview(
          `${process.env.REACT_APP_SERVERF_API}${user.user.data.profilePhoto}`
        );
      }
      initialized.current = true;
    }
  }, [user]);

  useEffect(() => {
    if (updateSuccess) {
      dispatch(clearUpdateSuccess());
    }
  }, [updateSuccess, dispatch]);

  useEffect(() => {
    if (uploadSuccess && uploadedPath && isUploadingHere) {
      setFormData((prevData) => {
        const newFormData = {
          ...prevData,
          profilePhoto: uploadedPath,
        };

        dispatch(clearError());
        dispatch(updateUser(newFormData));

        return newFormData;
      });

      dispatch(
        patchUser({ data: { ...user.user.data, profilePhoto: uploadedPath } })
      );

      dispatch(resetUpload());
      setIsUploadingHere(false);
    }
  }, [uploadSuccess, uploadedPath, isUploadingHere, dispatch]);

  const handleChange = (e) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };

    setFormData(newFormData);
    debouncedUpdate(newFormData);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      // alert("Пожалуйста, загрузите изображение");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // alert("Размер файла не должен превышать 5MB");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      setIsUploadingHere(true);
      dispatch(clearUploadError());

      await dispatch(uploadPhoto(file)).unwrap();
    } catch (error) {
      console.error("Ошибка загрузки фото:", error);
      // alert("Ошибка при загрузке фотографии");
      setIsUploadingHere(false);
    }
  };

  const getInitials = () => {
    if (!formData.fullName) return "ФИ";
    const names = formData.fullName.trim().split(" ");
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return names[0][0];
  };

  return (
    <section className={style.top}>
      <div className={style.top__wrapper}>
        <h1>Заявка на кредит</h1>

        <div className={style.top__main}>
          <Notification text="Чтобы направить заявку, необходимо дозаполнить ваши персональные данные" />

          <div className={style.top__main__name}>
            <div className={style.top__main__name__avatar}>
              <div className={style.top__main__name__avatar__img}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Фото профиля" />
                ) : (
                  <p>{getInitials()}</p>
                )}
              </div>

              <input
                type="file"
                id="avatar"
                hidden
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handlePhotoUpload}
                disabled={uploading}
              />

              <label htmlFor="avatar">
                <img src={camera} alt="Загрузить фото" />
              </label>
            </div>

            <div className={style.top__main__name__main}>
              <InputField
                label="Имя, Фамилия Отчество"
                placeholder={
                  screenWidth > 768
                    ? "Укажите Фамилию, Имя и Отчество (при наличии)"
                    : "Укажите ФИО"
                }
                id="full-name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                fontSize={screenWidth > 768 ? 24 : 16}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Top;
