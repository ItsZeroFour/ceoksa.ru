import React, { useEffect } from "react";

const CodeAuthStep = ({
  phone,
  code,
  hasError,
  inputRefs,
  isComplete,
  onCodeChange,
  onKeyDown,
  onPaste,
  onSubmit,
  onResend,
  onBack,
  resendDisabled,
  resendTimer,
  styles,
  isLoading,
}) => {
  // Авто-фокус на первый input при появлении
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <>
      <div className={styles.auth__text}>
        <h2>Введите код из SMS</h2>
        <p>На номер {phone} отправлен SMS-код подтверждения</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className={styles.auth__code}>
          {code.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern={index === 0 ? "[0-9]*" : "[0-9]"}
              maxLength={index === 0 ? code.length : 1}
              value={digit}
              onChange={(e) => onCodeChange(index, e.target.value)}
              onKeyDown={(e) => onKeyDown(index, e)}
              onPaste={onPaste}
              ref={(el) => (inputRefs.current[index] = el)}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              name={index === 0 ? "one-time-code" : undefined}
              className={`${styles.auth__code_input} ${
                hasError ? styles.error : ""
              }`}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {hasError && <p className={styles.auth__code__error}>Неверный код</p>}

        {isLoading && (
          <p className={styles.auth__code__loading}>Проверяем...</p>
        )}
      </form>

      <button
        className={styles.auth__code__newcode}
        onClick={onResend}
        disabled={resendDisabled}
        type="button"
      >
        {resendDisabled
          ? `Запросить повторно через ${resendTimer} сек.`
          : "Запросить повторный код"}
      </button>

      <button
        className={styles.auth__code__back}
        onClick={onBack}
        type="button"
      >
        Вернуться ко входу
      </button>
    </>
  );
};

export default CodeAuthStep;
