import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
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
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isSubmittingRef = useRef(false);
  const isAuthSucceededRef = useRef(false);

  const { data: filesData, status: filesStatus } = useSelector(
    (state) => state.files
  );

  const { auth_req_id, hhe_uri, flow } = useSelector(
    (state) => state.mobileAuth
  );

  const phoneInput = usePhoneInput();
  const codeInput = useCodeInput(4);
  const resendTimer = useResendTimer(140);

  const authPolling = useAuthPolling({
    onSuccess: () => {
      isAuthSucceededRef.current = true;
      setIsAuthLoading(false);
      setOpenAuthMenu(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate("/account/loan_applications");
    },
    onSmsRequired: () => {},
    onError: ({ status, canRetry }) => {
      setIsAuthLoading(false);

      if (canRetry || status === "expired" || status === "not_found") {
        authPolling.stopPolling();
        codeInput.reset();
        setCurrentStep("phone");
        phoneInput.setRetryHint(true);
      } else {
        codeInput.setError();
      }
    },
  });

  useEffect(() => {
    dispatch(fetchFiles("fajly?populate=*"));
  }, [dispatch]);

  // Авто-отправка при заполнении всех 4 цифр
  const handleSubmitCodeRef = useRef(null);

  useEffect(() => {
    codeInput.setOnComplete(() => {
      handleSubmitCodeRef.current?.();
    });
  }, []);

  useEffect(() => {
    if (flow === "sms" && currentStep === "push_wait") {
      authPolling.stopPolling();
      setCurrentStep("code");
    }
  }, [flow]);

  useEffect(() => {
    isSubmittingRef.current = false;
  }, [currentStep]);

  const handleSendSms = async () => {
    const clearPhone = phoneInput.getCleanPhone();
    const result = await dispatch(initiateAuth(clearPhone));

    if (result.meta.requestStatus === "fulfilled") {
      resendTimer.start();

      const { hhe_uri, auth_req_id } = result.payload;

      if (hhe_uri) {
        window.location.href = hhe_uri;
        return;
      }

      setCurrentStep("push_wait");
      authPolling.startPolling(auth_req_id);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer.isDisabled) return;

    const clearPhone = phoneInput.getCleanPhone();
    const result = await dispatch(initiateAuth(clearPhone));

    if (result.meta.requestStatus === "fulfilled") {
      codeInput.reset();
      resendTimer.start();
    }
  };

  const handleSubmitCode = async () => {
    if (isSubmittingRef.current) return;
    if (isAuthSucceededRef.current) return;

    const smsCode = codeInput.getCode();
    if (!smsCode || smsCode.length !== 4) return;

    isSubmittingRef.current = true;
    setIsAuthLoading(true);

    console.log("[Auth] handleSubmitCode: verify start", { auth_req_id });
    const result = await dispatch(verifyCode({ auth_req_id, code: smsCode }));
    console.log("[Auth] handleSubmitCode: verify result", {
      requestStatus: result.meta.requestStatus,
      auth_req_id,
    });

    isSubmittingRef.current = false;

    if (result.meta.requestStatus === "rejected") {
      setIsAuthLoading(false);
      codeInput.setError();
      return;
    }

    console.log("[Auth] handleSubmitCode: starting polling for", auth_req_id);
    authPolling.startPolling(auth_req_id);
  };
  handleSubmitCodeRef.current = handleSubmitCode;

  const handleBackToPhone = () => {
    codeInput.reset();
    phoneInput.reset();
    setCurrentStep("phone");
    resendTimer.reset();
    authPolling.stopPolling();
    isAuthSucceededRef.current = false;
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

          {currentStep === "phone" && (
            <PhoneAuthStep
              phoneInputRef={phoneInput.phoneInputRef}
              isPhoneComplete={phoneInput.isComplete}
              onSubmit={handleSendSms}
              filesData={filesData}
              filesStatus={filesStatus}
              styles={style}
            />
          )}

          {currentStep === "push_wait" && (
            <div className={style.auth__push_wait}>
              <div className={style.auth__text}>
                <h2>Подтвердите вход</h2>
                <p>
                  На номер {phoneInput.phone} отправлено PUSH-уведомление.
                  <br />
                  Нажмите «Принять» в уведомлении на телефоне.
                </p>
              </div>
            </div>
          )}

          {currentStep === "code" && (
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
              isLoading={isAuthLoading}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Auth;
