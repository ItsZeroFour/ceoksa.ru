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
import { fetchMe } from "../../redux/slices/auth/authSlice";

const Auth = ({ setOpenAuthMenu }) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState("phone");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isSubmittingRef = useRef(false);
  const isAuthSucceededRef = useRef(false);
  // Сохраняем «чистый» номер в момент первой отправки. На code-step
  // input телефона размонтирован → IMask уничтожен → phoneInput.getCleanPhone()
  // вернёт просто "7", и /mobile/auth/init упадёт 400.
  const submittedPhoneRef = useRef("");

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
    // Прямой переход на экран ввода кода в момент, когда poller увидел
    // status=sms_sent. Дублирует useEffect на flow, но не зависит от
    // редьюсер→re-render→effect цепочки — переход срабатывает мгновенно
    // в callback'е поллинга. Идемпотентно: повторный setCurrentStep("code")
    // безвреден.
    onSmsRequired: () => {
      setCurrentStep("code");
    },
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

  // Запасной таймер: если за 30 секунд на push_wait не пришёл ни sms_sent,
  // ни success/failed — принудительно переключаем на ввод кода. SMS у юзера
  // обычно уже на руках, а poller продолжает работать в фоне и подхватит
  // финальный success/failed как обычно.
  useEffect(() => {
    if (currentStep !== "push_wait") return;
    const timer = setTimeout(() => {
      setCurrentStep("code");
    }, 30_000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  useEffect(() => {
    isSubmittingRef.current = false;
  }, [currentStep]);

  const handleSendSms = async () => {
    const clearPhone = phoneInput.getCleanPhone();
    submittedPhoneRef.current = clearPhone;
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

    // submittedPhoneRef хранит номер с момента первой отправки;
    // на code-step phoneInput.getCleanPhone() уже не работает.
    const clearPhone = submittedPhoneRef.current || phoneInput.getCleanPhone();
    if (!/^7\d{10}$/.test(clearPhone)) {
      console.warn("[handleResendCode] Нет валидного номера для повторной отправки");
      return;
    }
    const result = await dispatch(initiateAuth(clearPhone));

    if (result.meta.requestStatus === "fulfilled") {
      const { auth_req_id } = result.payload;
      codeInput.reset();
      resendTimer.start();
      // У старой транзакции auth_req_id протух — рестартим поллинг с новым
      authPolling.stopPolling();
      if (auth_req_id) authPolling.startPolling(auth_req_id);
    }
  };

  const handleSubmitCode = async () => {
    if (isSubmittingRef.current) return;
    if (isAuthSucceededRef.current) return;

    const smsCode = codeInput.getCode();
    if (!smsCode || smsCode.length !== 4) return;

    isSubmittingRef.current = true;
    setIsAuthLoading(true);

    const result = await dispatch(verifyCode({ auth_req_id, code: smsCode }));

    isSubmittingRef.current = false;

    if (result.meta.requestStatus === "rejected") {
      setIsAuthLoading(false);
      codeInput.setError();
      return;
    }

    // Сервер мог успеть получить notification от МТС в течение запроса
    // и выставить cookie прямо здесь. Если authenticated === true —
    // авторизация уже завершена, не нужен polling.
    if (result.payload?.authenticated) {
      isAuthSucceededRef.current = true;
      try {
        await dispatch(fetchMe());
      } catch (e) {
        console.warn("fetchMe после verify не удался:", e);
      }
      setIsAuthLoading(false);
      setOpenAuthMenu(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate("/account/loan_applications");
      return;
    }

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
    submittedPhoneRef.current = "";
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
