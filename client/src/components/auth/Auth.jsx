import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import style from "./auth.module.scss";
import logo from "../../assets/logo.svg";
import logoDark from "../../assets/logo-dark.svg";
import { useTheme } from "../../hooks/useTheme";
import { usePhoneInput } from "../../hooks/usePhoneInput";
import { useCodeInput } from "../../hooks/useCodeInput";
import { useResendTimer } from "../../hooks/useResendTimer";
import { useAuthPolling } from "../../hooks/useAuthPolling";
import PhoneAuthStep from "./PhoneAuthStep/PhoneAuthStep";
import CodeAuthStep from "./CodeAuthStep/CodeAuthStep";
import { fetchFiles } from "../../redux/slices/strapi/FilesSlide";
import {
  initiateAuth,
  verifyCode,
} from "../../redux/slices/auth/mobileAuthSlice";

const Auth = ({ setOpenAuthMenu }) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState("phone");

  const dispatch = useDispatch();

  const { data: filesData, status: filesStatus } = useSelector(
    (state) => state.files,
  );
  const { auth_req_id } = useSelector((state) => state.mobileAuth);

  const phoneInput = usePhoneInput();
  const codeInput = useCodeInput(4);
  const resendTimer = useResendTimer(60);

  const authPolling = useAuthPolling({
    onSuccess: () => setOpenAuthMenu(false),
    onError: () => codeInput.setError(),
  });

  useEffect(() => {
    dispatch(fetchFiles("fajly?populate=*"));
  }, [dispatch]);

  const handleSendSms = async () => {
    const clearPhone = phoneInput.getCleanPhone();
    const result = await dispatch(initiateAuth(clearPhone));

    if (result.meta.requestStatus === "fulfilled") {
      setCurrentStep("code");
      resendTimer.start();
    }
  };

  const handleResendCode = async () => {
    if (!resendTimer.isDisabled) {
      const clearPhone = phoneInput.getCleanPhone();
      await dispatch(initiateAuth(clearPhone));
      resendTimer.start();
    }
  };

  const handleSubmitCode = async (e) => {
    e.preventDefault();

    if (!codeInput.isComplete) return;

    const smsCode = codeInput.getCode();
    const result = await dispatch(verifyCode({ auth_req_id, code: smsCode }));

    if (result.meta.requestStatus === "rejected") {
      codeInput.setError();
      return;
    }

    authPolling.startPolling(auth_req_id);
  };

  const handleBackToPhone = () => {
    codeInput.reset();
    phoneInput.reset();
    setCurrentStep("phone");
    resendTimer.reset();
    authPolling.stopPolling();
  };

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
            aria-label="Закрыть окно авторизации"
          />

          <p>Авторизация</p>

          {currentStep === "phone" ? (
            <PhoneAuthStep
              phoneInputRef={phoneInput.phoneInputRef}
              isPhoneComplete={phoneInput.isComplete}
              onSubmit={handleSendSms}
              filesData={filesData}
              filesStatus={filesStatus}
              styles={style}
            />
          ) : (
            <CodeAuthStep
              phone={phoneInput.phone}
              code={codeInput.code}
              hasError={codeInput.hasError}
              inputRefs={codeInput.inputRefs}
              isComplete={codeInput.isComplete}
              onCodeChange={codeInput.handleChange}
              onKeyDown={codeInput.handleKeyDown}
              onPaste={codeInput.handlePaste}
              onSubmit={handleSubmitCode}
              onResend={handleResendCode}
              onBack={handleBackToPhone}
              resendDisabled={resendTimer.isDisabled}
              resendTimer={resendTimer.timeLeft}
              styles={style}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Auth;
