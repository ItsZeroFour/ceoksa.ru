import React, { useState } from "react";
import style from "./credit.module.scss";
import { ReactComponent as Minus } from "../../../assets/icons/minus.svg";
import { ReactComponent as Plus } from "../../../assets/icons/plus.svg";
import { ReactComponent as Angle } from "../../../assets/icons/angle.svg";
import gosuslugi from "../../../assets/gosuslugi.png";
import info from "../../../assets/icons/info.svg";

const Credit = () => {
  const [value, setValue] = useState(500_000);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState({
    value: 60,
    title: "5 лет",
  });

  const [isOpenTarget, setIsOpenTarget] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState({
    valuke: "cash",
    title: "Кредит наличными",
  });

  const [cashValue, setCashValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [error, setError] = useState("");

  const terms = [
    { value: 3, title: "3 месяца" },
    { value: 6, title: "6 месяцев" },
    { value: 12, title: "1 год" },
    { value: 24, title: "2 года" },
    { value: 36, title: "3 года" },
    { value: 60, title: "5 лет" },
    { value: 120, title: "10 лет" },
  ];

  const targets = [
    { value: "cash", title: "Кредит наличными" },
    { value: "mortgage", title: "Ипотека" },
    { value: "car", title: "Автокредит" },
    { value: "education", title: "Образование" },
    { value: "renovation", title: "Ремонт" },
    { value: "travel", title: "Путешествия" },
    { value: "other", title: "Другое" },
  ];

  const formatNumber = (numStr) => {
    const digits = numStr.replace(/\D/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, "");
    setCashValue(formatNumber(digitsOnly));
    setError("");
  };

  const handleFocus = () => {
    setIsFocused(true);
    setIsTouched(true);
    setError("");
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (isTouched && !cashValue) {
      setError("Укажите размер заработной платы");
    } else {
      setError("");
    }
  };

  const displayValue = isFocused
    ? cashValue
    : cashValue
    ? `${cashValue} ₽`
    : "";

  return (
    <div className={style.credit}>
      <div className="container">
        <div className={style.credit__wrapper}>
          <h2 className={style.credit__title}>Подберём кредит</h2>
          <p className={style.credit__desc}>
            Сравните условия в разных банках и решите, где лучше взять кредит
            онлайн в 2026 году. Заполните анкету, чтобы узнать, в каких банках
            одобрят кредит
          </p>

          <div className={style.credit__main}>
            <h3 className={style.credit__main__title}>
              Подберём банки, которые готовы выдать вам кредит
            </h3>

            <form className={style.credit__main__form}>
              <div className={style.credit__main__form__elem}>
                <div className={style.credit__main__form__item}>
                  <button
                    type="button"
                    onClick={() =>
                      setValue((prev) => Math.max(0, prev - 100_000))
                    }
                  >
                    <Minus />
                  </button>

                  <p className={style.credit__main__form__item__total}>
                    {value.toLocaleString()}
                  </p>

                  <button
                    type="button"
                    onClick={() => setValue((prev) => prev + 100_000)}
                  >
                    <Plus />
                  </button>
                </div>

                <div className={style.credit__main__form__item}>
                  <div
                    className={style.credit__main__form__item__value}
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ cursor: "pointer" }}
                  >
                    <p>На срок</p>
                    <p>{selectedTerm.title}</p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(!isOpen);
                    }}
                    aria-label="Выбрать срок кредита"
                  >
                    <Angle />
                  </button>

                  {isOpen && (
                    <ul className={style.dropdown__list}>
                      {terms.map((term) => (
                        <li
                          key={term.value}
                          className={style.dropdown__item}
                          onClick={() => {
                            setSelectedTerm(term);
                            setIsOpen(false);
                          }}
                        >
                          {term.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className={style.credit__main__form__target}>
                <div
                  className={style.credit__main__form__item__value}
                  onClick={() => setIsOpen(!isOpenTarget)}
                  style={{ cursor: "pointer" }}
                >
                  <p>Цель кредита</p>
                  <p>{selectedTarget.title}</p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpenTarget(!isOpenTarget);
                  }}
                  aria-label="Выбрать цель кредита"
                >
                  <Angle />
                </button>

                {isOpenTarget && (
                  <ul className={style.dropdown__list}>
                    {targets.map((target) => (
                      <li
                        key={target.value}
                        className={style.dropdown__item}
                        onClick={() => {
                          setSelectedTarget(target);
                          setIsOpenTarget(false);
                        }}
                      >
                        {target.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div
                className={`${style.credit__main__form__cash} ${
                  error && style.error
                }`}
              >
                <div className={style.credit__main__form__item__value}>
                  <p>Размер заработной платы</p>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Например, 100 000 ₽"
                      value={displayValue}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      className={`${style.salaryInput} ${
                        error ? style.inputError : ""
                      }`}
                    />
                  </div>

                  {error && (
                    <p
                      id="salary-error"
                      className={style.credit__main__form__cash__error}
                    >
                      {error}
                    </p>
                  )}
                </div>
              </div>

              <button className={style.credit__main__form__auth}>
                <img src={gosuslugi} alt="Госуслуги" /> Продолжить
                через Госуслуги
              </button>
            </form>

            <div className={style.credit__main__info}>
              <img src={info} alt="info" />
              <p>
                Войдите через Госуслуги — мы заполним данные автоматически и
                рассчитаем ставку и сумму на основе кредитной истории
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credit;
