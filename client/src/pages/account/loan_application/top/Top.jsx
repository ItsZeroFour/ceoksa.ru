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
  const { updateSuccess } = useSelector((state) => state.updateUser);
  const user = useSelector((state) => state.auth);
  const initialized = useRef(false);
  const isUploadingHere = useRef(false);
  const formDataRef = useRef({ fullName: "", profilePhoto: "" });

  const { uploadedPath, uploading, uploadSuccess } = useSelector(
    (state) => state.upload
  );

  const [formData, setFormData] = useState(formDataRef.current);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const screenWidth = useScreenWidth();

  const debouncedUpdate = useDebouncedUpdate((data) => {
    dispatch(clearError());
    dispatch(updateUser(data));
  }, 3000);

  useEffect(() => {
    if (!initialized.current && user.status === "succeeded" && user.user.data) {
      const data = {
        fullName: user.user.data.fullName || "",
        profilePhoto: user.user.data.profilePhoto || "",
      };
      formDataRef.current = data;
      setFormData(data);
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
    if (uploadSuccess && uploadedPath && isUploadingHere.current) {
      setFormData((prevData) => {
        const newFormData = { ...prevData, profilePhoto: uploadedPath };
        dispatch(clearError());
        dispatch(updateUser(newFormData));
        return newFormData;
      });
      dispatch(
        patchUser({ data: { ...user.user.data, profilePhoto: uploadedPath } })
      );
      dispatch(resetUpload());
      isUploadingHere.current = false;
    }
  }, [uploadSuccess, uploadedPath, dispatch]);

  const validate = (fieldName, value) => {
    if (fieldName === "fullName") {
      if (!value) return "Поле обязательно";
      if (value.trim().length < 2) return "Минимум 2 символа";
      if (value.trim().split(" ").length < 2) return "Укажите имя и фамилию";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formDataRef.current, [name]: value };
    formDataRef.current = newFormData;
    setFormData(newFormData);

    const err = validate(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));

    if (!err) {
      debouncedUpdate(newFormData);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 7 * 1024 * 1024) {
      alert("Размер файла не должен превышать 7MB");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);

      isUploadingHere.current = true;
      dispatch(clearUploadError());
      await dispatch(uploadPhoto(file)).unwrap();
    } catch (error) {
      console.error("Ошибка загрузки фото:", error);
      isUploadingHere.current = false;
    }
  };

  const getInitials = () => {
    if (!formData.fullName) return "ФИ";
    const names = formData.fullName.trim().split(" ");
    if (names.length >= 2) return names[0][0] + names[1][0];
    return names[0][0];
  };

  const formatFullName = (str) =>
    str
      ? str
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ")
      : "";

  return (
    <section className={style.top}>
      <div className={style.top__wrapper}>
        <h1>Заявка на кредит</h1>

        <div className={style.top__main}>
          <Notification text="Чтобы направить заявку, необходимо дозаполнить ваши персональные данные" />

          <div
            className={`${style.top__main__name} ${
              errors.fullName ? style.error : ""
            }`}
          >
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
                value={formatFullName(formData.fullName)}
                onChange={handleChange}
                fontSize={screenWidth > 768 ? 24 : 16}
              />
            </div>
          </div>

          {errors.fullName && (
            <span className={style.error_text}>{errors.fullName}</span>
          )}
        </div>
      </div>
    </section>
  );
};

export default Top;
