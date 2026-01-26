import React, { useEffect, useRef, useState } from "react";
import style from "./auth.module.scss";
import logo from "../../assets/logo.svg";
import logoDark from "../../assets/logo-dark.svg";
import { useTheme } from "../../hooks/useTheme";
import { Link } from "react-router-dom";
import gosuslugi from "../../assets/gosuslugi.png";
import GosuslugiButton from "../gosuslugi_button/GosuslugiButton";
import IMask from "imask";
import { useDispatch, useSelector } from "react-redux";
import { fetchFiles } from "../../redux/slices/strapi/FilesSlide";

const Auth = ({ setOpenAuthMenu }) => {
  const { theme } = useTheme();

  const phoneInputRef = useRef(null);
  const [isPhoneComplete, setIsPhoneComplete] = useState(false);
  const [sendSms, setSendSms] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [hasError, setHasError] = useState(false);
  const inputRefs = useRef([]);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const dispatch = useDispatch();

  const { data, status, error } = useSelector((state) => state.files);

  useEffect(() => {
    dispatch(fetchFiles("fajly?populate=*"));
  }, [dispatch]);

  useEffect(() => {
    if (!phoneInputRef.current) return;

    const maskOptions = {
      mask: "+{7} (000) 000-00-00",
      lazy: true,
    };

    const mask = IMask(phoneInputRef.current, maskOptions);

    const handleChange = () => {
      const isValid = mask.unmaskedValue.length === 11;

      console.log(mask.unmaskedValue.length, isValid);

      setIsPhoneComplete(isValid);
    };

    mask.on("accept", () => {
      handleChange();
      setPhone(mask._value);
    });

    handleChange();

    return () => {
      mask.destroy();
    };
  }, [sendSms]);

  useEffect(() => {
    let interval = null;

    if (sendSms && resendDisabled && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sendSms, resendDisabled, resendTimer]);

  useEffect(() => {
    if (!sendSms) {
      setResendDisabled(false);
      setResendTimer(60);
    }
  }, [sendSms]);

  const onSendSms = async () => {
    setSendSms(true);
    setResendDisabled(true);
    setResendTimer(60);
  };

  const handleResendCode = () => {
    if (!resendDisabled) {
      console.log("Повторная отправка кода на", phone);
      setResendDisabled(true);
      setResendTimer(60);
    }
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setHasError(false);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (pasted) {
      const newCode = ["", "", "", ""];
      for (let i = 0; i < pasted.length; i++) {
        newCode[i] = pasted[i];
      }
      setCode(newCode);
      setHasError(false);
      const focusIndex = Math.min(pasted.length - 1, 3);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setHasError(true);

    const isComplete = code.every((digit) => digit !== "");
    if (!isComplete) {
      const firstEmpty = code.findIndex((d) => d === "");
      if (firstEmpty !== -1) {
        inputRefs.current[firstEmpty]?.focus();
      }
      return;
    }

    console.log(code.join(""));
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  return (
    <section className={style.auth}>
      <div className="container">
        <div className={style.auth__wrapper}>
          <Link to="/">
            <img src={theme === "light" ? logo : logoDark} alt="лого" />
          </Link>

          <button
            className={style.auth__close}
            onClick={() => setOpenAuthMenu(false)}
          />

          <p>Авторизация</p>

          {!sendSms ? (
            <>
              <div className={style.auth__text}>
                <h2>Введите номер телефона</h2>

                <p>
                  Введите номер мобильного телефона для получения одноразового
                  кода доступа.
                </p>
              </div>

              <form>
                <div className={style.auth__form__input}>
                  <label htmlFor="phone">Номер телефона</label>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    id="phone"
                    placeholder="+7 (9XX) XXX-XX-XX"
                  />
                </div>

                {status === "succeeded" && (
                  <>
                    <button
                      type="button"
                      disabled={!isPhoneComplete}
                      onClick={onSendSms}
                    >
                      Получить код
                    </button>

                    <p>
                      Нажимая на кнопку «Получить код», Вы даете{" "}
                      <Link
                        to={`${process.env.REACT_APP_ADMIN_IMAGES}${data.consent_to_the_processing_of_personal_data_by_telecom_operators.url}`}
                        target="_blank"
                      >
                        согласия
                      </Link>{" "}
                      и принимаете{" "}
                      <Link to="/privacy-policy" target="_blank">
                        условия политики конфиденциальности.
                      </Link>
                    </p>
                  </>
                )}
              </form>

              <div className={style.auth__or}>
                <div className={style.auth__or__text}>
                  <p>или</p>
                </div>

                <GosuslugiButton />
              </div>
            </>
          ) : (
            <>
              <div className={style.auth__text}>
                <h2>Введите код из SMS</h2>

                <p>На номер {phone} отправлен SMS-код подтверждения</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className={style.auth__code}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="\d"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      ref={(el) => (inputRefs.current[index] = el)}
                      className={`${style.auth__code_input} ${
                        hasError ? style.error : ""
                      }`}
                    />
                  ))}
                </div>

                {hasError && (
                  <p className={style.auth__code__error}>Неверный код</p>
                )}

                <button type="submit" disabled={!isCodeComplete}>
                  Отправить
                </button>
              </form>

              <button
                className={style.auth__code__newcode}
                onClick={handleResendCode}
                disabled={resendDisabled}
              >
                {resendDisabled
                  ? `Запросить повторно через ${resendTimer} сек.`
                  : "Запросить повторный код"}
              </button>

              <button
                className={style.auth__code__back}
                onClick={() => {
                  setCode(["", "", "", ""]);
                  setPhone("");
                  setSendSms(false);
                }}
              >
                Вернуться ко входу
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Auth;
