import React, { useEffect, useRef, useState } from "react";
import style from "./credit.module.scss";
import { ReactComponent as Minus } from "../../../assets/icons/minus.svg";
import { ReactComponent as Plus } from "../../../assets/icons/plus.svg";
import gosuslugi from "../../../assets/gosuslugi.png";
import info from "../../../assets/icons/info.svg";
import DropdownSelector from "../../../components/dropdown_selector/DropdownSelector";

const TERMS = [
  { value: 3, title: "3 месяца" },
  { value: 6, title: "6 месяцев" },
  { value: 9, title: "9 месяцев" },
  { value: 12, title: "1 год" },
  { value: 24, title: "2 года" },
  { value: 36, title: "3 года" },
  { value: 48, title: "4 года" },
  { value: 60, title: "5 лет" },
];

const TARGETS = [
  { value: "cash", title: "Кредит наличными" },
  { value: "mortgage", title: "Ипотека" },
  { value: "car", title: "Автокредит" },
  { value: "education", title: "Образование" },
  { value: "renovation", title: "Ремонт" },
  { value: "travel", title: "Путешествия" },
  { value: "other", title: "Другое" },
];

const Credit = () => {
  const [value, setValue] = useState(500_000);
  const [selectedTerm, setSelectedTerm] = useState(TERMS[5]);
  const [selectedTarget, setSelectedTarget] = useState(TARGETS[0]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [salaryRaw, setSalaryRaw] = useState("");
  const [salaryError, setSalaryError] = useState("");
  const [isSalaryFocused, setIsSalaryFocused] = useState(false);

  const termRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        termRef.current &&
        !termRef.current.contains(event.target) &&
        targetRef.current &&
        !targetRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (type) => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  const formatNumber = (value) => {
    if (!value) return "";
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleTotalChange = (event) => {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/\D/g, "");

    if (inputValue === "") {
      setValue(0);
      return;
    }

    const numValue = Number(inputValue);
    setValue(numValue < 0 ? 0 : numValue);
  };

  const handleTotalFocus = (event) => {
    if (value === 0) {
      event.target.value = "";
    }
  };

  const handleTotalBlur = (event) => {
    if (event.target.value === "") {
      setValue(0);
    }
  };

  const handleSalaryChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setSalaryRaw(digitsOnly);
    if (salaryError) setSalaryError("");
  };

  const handleSalaryFocus = () => {
    setIsSalaryFocused(true);
    setSalaryError("");
  };

  const handleSalaryBlur = () => {
    setIsSalaryFocused(false);
    if (!salaryRaw) {
      setSalaryError("Укажите размер заработной платы");
    } else {
      setSalaryError("");
    }
  };

  const displaySalary = isSalaryFocused
    ? formatNumber(salaryRaw)
    : salaryRaw
    ? `${formatNumber(salaryRaw)} ₽`
    : "";

  return (
    <section className={style.credit}>
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
                    onClick={() => setValue((prev) => Math.max(0, prev - 1000))}
                  >
                    <Minus />
                  </button>

                  <input
                    className={style.credit__main__form__item__total}
                    value={value === 0 ? "0" : value.toLocaleString()}
                    onChange={handleTotalChange}
                    onFocus={handleTotalFocus}
                    onBlur={handleTotalBlur}
                  />

                  <button
                    type="button"
                    onClick={() => setValue((prev) => prev + 1000)}
                  >
                    <Plus />
                  </button>
                </div>

                <DropdownSelector
                  ref={termRef}
                  label="На срок"
                  selected={selectedTerm}
                  options={TERMS}
                  isOpen={openDropdown}
                  onToggle={() => toggleDropdown("term")}
                  onSelect={(term) => {
                    setSelectedTerm(term);
                    setOpenDropdown(null);
                  }}
                  dropdownType="term"
                  ariaLabel="Выбрать срок кредита"
                />
              </div>

              <div className={style.credit__main__form__other}>
                <DropdownSelector
                  ref={targetRef}
                  label="Цель кредита"
                  selected={selectedTarget}
                  options={TARGETS}
                  isOpen={openDropdown}
                  onToggle={() => toggleDropdown("target")}
                  onSelect={(target) => {
                    setSelectedTarget(target);
                    setOpenDropdown(null);
                  }}
                  dropdownType="target"
                  ariaLabel="Выбрать цель кредита"
                />

                <div
                  className={`${style.credit__main__form__cash} ${
                    salaryError && style.error
                  }`}
                >
                  <div className={style.credit__main__form__item__value}>
                    <p>Размер заработной платы</p>
                    <div
                      className={
                        style.credit__main__form__item__input__container
                      }
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Например, 100 000 ₽"
                        value={displaySalary}
                        onChange={handleSalaryChange}
                        onFocus={handleSalaryFocus}
                        onBlur={handleSalaryBlur}
                        className={`${style.salaryInput} ${
                          salaryError ? style.inputError : ""
                        }`}
                      />
                    </div>

                    {salaryError && (
                      <p
                        id="salary-error"
                        className={style.credit__main__form__cash__error}
                      >
                        {salaryError}
                      </p>
                    )}
                  </div>
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
    </section>
  );
};

export default Credit;
