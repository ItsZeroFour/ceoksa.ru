import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "./credit.module.scss";
import DropdownSelector from "../../../components/dropdown_selector/DropdownSelector";
import Notification from "../../../components/notification/Notification";
import CreditSceleton from "../../../components/sceletons/CreditSceleton";
import CreditAmountInput from "../../../components/credit/CreditAmountInput/CreditAmountInput";
import SalaryInput from "../../../components/credit/SalaryInput/SalaryInput";
import CreditFormButtons from "../../../components/credit/CreditFormButtons/CreditFormButtons";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { useDropdown } from "../../../hooks/useDropdown";
import { useScreenWidth } from "../../../hooks/useScreenWidth";
import { useCreditAmount } from "../../../hooks/useCreditAmount";
import { useSalaryValidation } from "../../../hooks/useSalaryValidation";
import { fetchCredit } from "../../../redux/slices/strapi/creditSlice";
import {
  TERMS,
  TARGETS,
  CREDIT_LIMITS,
} from "../../../constants/creditConstants";

const Credit = ({ setOpenAuthMenu }) => {
  const [selectedTerm, setSelectedTerm] = useState(TERMS[5]);
  const [selectedTarget, setSelectedTarget] = useState(TARGETS[0]);

  const termRef = useRef(null);
  const targetRef = useRef(null);

  const screenWidth = useScreenWidth();
  const dispatch = useDispatch();

  const { data, status } = useSelector((state) => state.credit);

  // Хуки для управления состоянием формы
  const creditAmount = useCreditAmount({
    initialValue: 500000,
    minAmount: CREDIT_LIMITS.MIN_AMOUNT,
    maxAmount: CREDIT_LIMITS.MAX_AMOUNT,
    step: CREDIT_LIMITS.STEP,
  });

  const salary = useSalaryValidation({
    minSalary: CREDIT_LIMITS.MIN_SALARY,
    maxSalary: CREDIT_LIMITS.MAX_AMOUNT,
    debounceDelay: 300,
  });

  const { openDropdown, toggleDropdown, closeDropdown, setOpenDropdown } =
    useDropdown();

  useOutsideClick([termRef, targetRef], closeDropdown);

  useEffect(() => {
    dispatch(fetchCredit("kredit?populate=*"));
  }, [dispatch]);

  const handleTermSelect = (term) => {
    setSelectedTerm(term);
    setOpenDropdown(null);
  };

  const handleTargetSelect = (target) => {
    setSelectedTarget(target);
    setOpenDropdown(null);
  };

  const handleContinue = () => {
    if (salary.salaryValue && !salary.salaryError) {
      setOpenAuthMenu(true);
    }
  };

  const isContinueDisabled = !salary.salaryValue || !!salary.salaryError;

  if (status === "loading" || status === "failed") {
    return (
      <section className={style.credit} id="credit">
        <div className="container">
          <CreditSceleton />
        </div>
      </section>
    );
  }

  return (
    <section className={style.credit} id="credit">
      <div className="container">
        <div className={style.credit__wrapper}>
          <h2 className={style.credit__title}>{data.title}</h2>
          <p className={style.credit__desc}>{data.description}</p>

          <div className={style.credit__main}>
            <h3 className={style.credit__main__title}>{data.subtitle}</h3>

            <form
              className="credit__main__form"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="credit__main__form__elem">
                <CreditAmountInput
                  value={creditAmount.displayAmount}
                  onChange={creditAmount.handleAmountChange}
                  onFocus={creditAmount.handleAmountFocus}
                  onBlur={creditAmount.handleAmountBlur}
                  onIncrement={creditAmount.increment}
                  onDecrement={creditAmount.decrement}
                />

                <div className="credit__main__data">
                  <DropdownSelector
                    ref={termRef}
                    label="На срок"
                    selected={selectedTerm}
                    options={TERMS}
                    isOpen={openDropdown}
                    onToggle={() => toggleDropdown("term")}
                    onSelect={handleTermSelect}
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
                  onSelect={handleTargetSelect}
                  dropdownType="target"
                  ariaLabel="Выбрать цель кредита"
                />

                <SalaryInput
                  value={salary.displaySalary}
                  error={salary.salaryError}
                  onChange={salary.handleSalaryChange}
                  onFocus={salary.handleSalaryFocus}
                  onBlur={salary.handleSalaryBlur}
                  onKeyDown={salary.handleKeyDown}
                />
              </div>

              <CreditFormButtons
                screenWidth={screenWidth}
                onContinue={handleContinue}
                isDisabled={isContinueDisabled}
              />
            </form>

            <Notification text="Авторизация через Госуслуги находится в процессе разработки и скоро будет доступна" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Credit;
