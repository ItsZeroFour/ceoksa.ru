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
import { useDebouncedUpdate } from "../../../hooks/useDebouncedUpdate";
import { fetchCredit } from "../../../redux/slices/strapi/creditSlice";
import {
  updateUser,
  clearError,
} from "../../../redux/slices/user/updateUserSlice";
import {
  TERMS,
  TARGETS,
  CREDIT_LIMITS,
} from "../../../constants/creditConstants";
import { useNavigate } from "react-router-dom";

const DRAFT_KEY = "credit_form_draft";

const Credit = ({ setOpenAuthMenu }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth);
  const isAuthenticated = user?.isAuth ?? false;
  const prevIsAuth = useRef(isAuthenticated);

  const loanApplication = user?.user?.data?.loan_application;

  const draft = !isAuthenticated
    ? JSON.parse(localStorage.getItem(DRAFT_KEY) || "null")
    : null;

  const initialSum = loanApplication?.sum ?? draft?.sum ?? 500000;
  const initialTerm =
    TERMS.find((t) => t.value === (loanApplication?.date ?? draft?.date)) ??
    TERMS[5];
  const initialTarget =
    TARGETS.find(
      (t) => t.value === (loanApplication?.target ?? draft?.target)
    ) ?? TARGETS[0];

  const [selectedTerm, setSelectedTerm] = useState(initialTerm);
  const [selectedTarget, setSelectedTarget] = useState(initialTarget);

  const termRef = useRef(null);
  const targetRef = useRef(null);

  const screenWidth = useScreenWidth();

  const { data, status } = useSelector((state) => state.credit);

  const creditAmount = useCreditAmount({
    initialValue: initialSum,
    minAmount: CREDIT_LIMITS.MIN_AMOUNT,
    maxAmount: CREDIT_LIMITS.MAX_AMOUNT,
    step: CREDIT_LIMITS.STEP,
  });

  const salary = useSalaryValidation({
    initialValue: loanApplication?.salary ?? draft?.salary ?? "",
    minSalary: CREDIT_LIMITS.MIN_SALARY,
    maxSalary: CREDIT_LIMITS.MAX_AMOUNT,
    debounceDelay: 300,
  });

  const { openDropdown, toggleDropdown, closeDropdown, setOpenDropdown } =
    useDropdown();

  useOutsideClick([termRef, targetRef], closeDropdown);

  const debouncedUpdate = useDebouncedUpdate((data) => {
    dispatch(clearError());
    dispatch(updateUser({ loan_application: data }));
  }, 1000);

  useEffect(() => {
    dispatch(fetchCredit("kredit?populate=*"));
  }, [dispatch]);

  useEffect(() => {
    if (user.status === "succeeded" && user.user?.data?.loan_application) {
      const loan = user.user.data.loan_application;

      const savedTerm = TERMS.find((t) => t.value === loan.date);
      if (savedTerm) setSelectedTerm(savedTerm);

      const savedTarget = TARGETS.find((t) => t.value === loan.target);
      if (savedTarget) setSelectedTarget(savedTarget);

      if (loan.salary) salary.setSalaryValue(loan.salary);
    }
  }, [user.status]);

  useEffect(() => {
    if (isAuthenticated) return;

    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        sum: creditAmount.amountValue,
        date: selectedTerm.value,
        target: selectedTarget.value,
        salary: salary.salaryValue,
      })
    );
  }, [
    isAuthenticated,
    creditAmount.amountValue,
    selectedTerm,
    selectedTarget,
    salary.salaryValue,
  ]);

  useEffect(() => {
    const justLoggedIn = !prevIsAuth.current && isAuthenticated;
    prevIsAuth.current = isAuthenticated;

    if (!justLoggedIn) return;

    const savedDraft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (!savedDraft) return;

    dispatch(clearError());
    dispatch(updateUser({ loan_application: savedDraft }));
    localStorage.removeItem(DRAFT_KEY);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    debouncedUpdate({
      sum: creditAmount.amountValue,
      date: selectedTerm.value,
      target: selectedTarget.value,
      salary: salary.salaryValue,
    });
  }, [
    isAuthenticated,
    creditAmount.amountValue,
    selectedTerm,
    selectedTarget,
    salary.salaryValue,
  ]);

  const handleTermSelect = (term) => {
    setSelectedTerm(term);
    setOpenDropdown(null);
  };

  const handleTargetSelect = (target) => {
    setSelectedTarget(target);
    setOpenDropdown(null);
  };

  const handleContinue = () => {
    if (!salary.salaryValue || !!salary.salaryError) {
      salary.handleSalaryBlur();
      return;
    }

    if (isAuthenticated) {
      dispatch(clearError());
      debouncedUpdate({
        sum: creditAmount.amountValue,
        date: selectedTerm.value,
        target: selectedTarget.value,
        salary: salary.salaryValue,
      });

      navigate("/account/loan_applications");
    } else {
      setOpenAuthMenu(true);
    }
  };

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
