import React, { useEffect, useRef, useState } from "react";
import style from "./credit.module.scss";
import { ReactComponent as Minus } from "../../../assets/icons/minus.svg";
import { ReactComponent as Plus } from "../../../assets/icons/plus.svg";
import gosuslugi from "../../../assets/gosuslugi.png";
import DropdownSelector from "../../../components/dropdown_selector/DropdownSelector";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { useNumberFormatter } from "../../../hooks/useNumberFormatter";
import { useDropdown } from "../../../hooks/useDropdown";
import { useSalaryValidation } from "../../../hooks/useSalaryValidation";
import Notification from "../../../components/notification/Notification";
import { useDispatch, useSelector } from "react-redux";
import CreditSceleton from "../../../components/sceletons/CreditSceleton";
import { fetchCredit } from "../../../redux/slices/strapi/creditSlice";

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
  { value: "car", title: "Покупка авто" },
  { value: "education", title: "Образование" },
  { value: "renovation", title: "Ремонт" },
  { value: "travel", title: "Путешествия" },
  { value: "other", title: "Другое" },
];

const Credit = () => {
  const [value, setValue] = useState(500_000);
  const [selectedTerm, setSelectedTerm] = useState(TERMS[5]);
  const [selectedTarget, setSelectedTarget] = useState(TARGETS[0]);
  const [isTotalFocused, setIsTotalFocused] = useState(false);
  const termRef = useRef(null);
  const targetRef = useRef(null);

  const dispatch = useDispatch();

  const { data, status, error } = useSelector((state) => state.credit);

  useEffect(() => {
    dispatch(fetchCredit("kredit?populate=*"));
  }, [dispatch]);

  /* HOOKS */
  const { openDropdown, toggleDropdown, closeDropdown, setOpenDropdown } =
    useDropdown();
  useOutsideClick([termRef, targetRef], closeDropdown);
  const {
    salaryError,
    displaySalary,
    handleSalaryChange,
    handleSalaryFocus,
    handleSalaryBlur,
  } = useSalaryValidation();

  const handleTotalChange = (event) => {
    let inputValue = event.target.value.replace(/\D/g, "");

    if (inputValue === "") {
      setValue(0);
      return;
    }

    let numValue = Number(inputValue);

    if (numValue > 10_000_000) {
      numValue = 10_000_000;
    }

    setValue(numValue);
  };

  const handleTotalFocus = (event) => {
    setIsTotalFocused(true);
    if (value === 0) {
      event.target.value = "";
    }
  };

  const handleTotalBlur = (event) => {
    setIsTotalFocused(false);
    if (event.target.value === "") {
      setValue(0);
    }
  };

  return (
    <section className={style.credit} id="credit">
      <div className="container">
        {status === "loading" || status === "failed" ? (
          <CreditSceleton />
        ) : (
          <div className={style.credit__wrapper}>
            <h2 className={style.credit__title}>{data.title}</h2>
            <p className={style.credit__desc}>{data.description}</p>

            <div className={style.credit__main}>
              <h3 className={style.credit__main__title}>{data.subtitle}</h3>

              <form className="credit__main__form">
                <div className="credit__main__form__elem">
                  <div className={`credit__main__form__item`}>
                    <button
                      type="button"
                      onClick={() =>
                        setValue((prev) =>
                          Math.min(10_000_000, Math.max(0, prev - 1000))
                        )
                      }
                    >
                      <Minus />
                    </button>

                    <input
                      className="credit__main__form__item__total"
                      inputMode="numeric"
                      value={
                        isTotalFocused
                          ? value === 0
                            ? ""
                            : String(value)
                          : value === 0
                          ? ""
                          : `${value} ₽`
                      }
                      onChange={handleTotalChange}
                      onFocus={handleTotalFocus}
                      onBlur={handleTotalBlur}
                      max="10000000"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setValue((prev) => Math.min(10_000_000, prev + 1000))
                      }
                    >
                      <Plus />
                    </button>
                  </div>

                  <div className="credit__main__data">
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
                </div>

                <div className="credit__main__form__other">
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
                    className={`credit__main__form__cash ${
                      salaryError && "error"
                    }`}
                  >
                    <div className="credit__main__form__item__value">
                      <p>Размер заработной платы</p>
                      <div className="credit__main__form__item__input__container">
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
                          className="credit__main__form__cash__error"
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

              <Notification
                text="Войдите через Госуслуги — мы заполним данные автоматически и рассчитаем
                    ставку и сумму на основе кредитной истории"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Credit;
