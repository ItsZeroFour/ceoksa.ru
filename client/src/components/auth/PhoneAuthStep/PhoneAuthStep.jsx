import React from "react";
import { Link } from "react-router-dom";
import GosuslugiButton from "../../gosuslugi_button/GosuslugiButton";

const PhoneAuthStep = ({
  phoneInputRef,
  isPhoneComplete,
  onSubmit,
  filesData,
  filesStatus,
  styles,
}) => {
  return (
    <>
      <div className={styles.auth__text}>
        <h2>Введите номер телефона</h2>
        <p>Введите номер мобильного телефона для использования сервиса ОКСА.</p>
      </div>

      <form>
        <div className={styles.auth__form__input}>
          <label htmlFor="phone">Номер телефона</label>
          <input
            ref={phoneInputRef}
            type="tel"
            id="phone"
            placeholder="+7 (9XX) XXX-XX-XX"
          />
        </div>

        {filesStatus === "succeeded" && (
          <>
            <button
              type="button"
              disabled={!isPhoneComplete}
              onClick={onSubmit}
            >
              Войти
            </button>

            <p>
              Нажимая на кнопку «Войти», Вы даете{" "}
              <Link
                to={`${process.env.REACT_APP_ADMIN_IMAGES}${filesData.consent_to_the_processing_of_personal_data_by_telecom_operators.url}`}
                target="_blank"
              >
                согласия
              </Link>{" "}
              и принимаете{" "}
              <Link to="/privacy-policy" target="_blank">
                условия политики конфиденциальности,
              </Link>{" "}
              <Link to="/polzovatelskoe-soglashenie" target="_blank">
                пользовательского соглашения
              </Link>
            </p>
          </>
        )}
      </form>

      <div className={styles.auth__or}>
        <div className={styles.auth__or__text}>
          <p>или</p>
        </div>
        <GosuslugiButton />
      </div>
    </>
  );
};

export default PhoneAuthStep;
