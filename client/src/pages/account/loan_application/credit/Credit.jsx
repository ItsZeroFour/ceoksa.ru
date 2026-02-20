import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "./credit.module.scss";
import { useOutsideClick } from "../../../../hooks/useOutsideClick";
import { useDropdown } from "../../../../hooks/useDropdown";
import { useCreditAmount } from "../../../../hooks/useCreditAmount";
import { useSalaryValidation } from "../../../../hooks/useSalaryValidation";
import { useDebouncedUpdate } from "../../../../hooks/useDebouncedUpdate";
import { fetchFiles } from "../../../../redux/slices/strapi/FilesSlide";
import {
  updateUser,
  clearError,
} from "../../../../redux/slices/user/updateUserSlice";
import {
  TERMS,
  TARGETS,
  CREDIT_LIMITS,
} from "../../../../constants/creditConstants";
import CreditAmountSection from "../../../../components/account/CreditAmountSection/CreditAmountSection";
import CreditTargetSection from "../../../../components/account/CreditTargetSection/CreditTargetSection";
import CreditSalaryInput from "../../../../components/account/CreditSalaryInput/CreditSalaryInput";
import CreditFooter from "../../../../components/account/CreditFooter/CreditFooter";

const Credit = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth);

  const loanApplication = user?.user?.data?.loan_application;

  const initialSum = loanApplication?.sum ?? 500000;
  const initialTerm =
    TERMS.find((t) => t.value === loanApplication?.date) ?? TERMS[5];
  const initialTarget =
    TARGETS.find((t) => t.value === loanApplication?.target) ?? TARGETS[0];

  const [selectedTerm, setSelectedTerm] = useState(initialTerm);
  const [selectedTarget, setSelectedTarget] = useState(initialTarget);

  const termRef = useRef(null);
  const targetRef = useRef(null);

  const { data: filesData, status: filesStatus } = useSelector(
    (state) => state.files
  );

  const creditAmount = useCreditAmount({
    initialValue: initialSum,
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

  const debouncedUpdate = useDebouncedUpdate((data) => {
    dispatch(clearError());
    dispatch(updateUser({ loan_application: data }));
  }, 1000);

  useEffect(() => {
    dispatch(fetchFiles("fajly?populate=*"));
  }, [dispatch]);

  // Синхронизация сохранённых данных после загрузки пользователя
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

  // Авто-сохранение при изменении любого поля
  useEffect(() => {
    debouncedUpdate({
      sum: creditAmount.amountValue,
      date: selectedTerm.value,
      target: selectedTarget.value,
      salary: salary.salaryValue,
    });
  }, [
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

  const handleSubmit = () => {
    if (!salary.salaryValue || !!salary.salaryError) {
      salary.handleSalaryBlur();
      return;
    }

    dispatch(clearError());
    dispatch(
      updateUser({
        loan_application: {
          sum: creditAmount.amountValue,
          date: selectedTerm.value,
          target: selectedTarget.value,
          salary: salary.salaryValue,
        },
      })
    );
  };

  return (
    <section className={style.credit} id="credit">
      <div className={style.credit__wrapper}>
        <h2 className={style.credit__title}>
          Укажите сумму, срок и цель вашего кредита
        </h2>

        <div className={style.credit__main}>
          <form
            className={`credit__main__form ${style.credit__main__form__special}`}
            onSubmit={(e) => e.preventDefault()}
          >
            <CreditAmountSection
              value={creditAmount.displayAmount}
              onChange={creditAmount.handleAmountChange}
              onFocus={creditAmount.handleAmountFocus}
              onBlur={creditAmount.handleAmountBlur}
              onIncrement={creditAmount.increment}
              onDecrement={creditAmount.decrement}
              selectedTerm={selectedTerm}
              onTermSelect={handleTermSelect}
              termOptions={TERMS}
              termRef={termRef}
              openDropdown={openDropdown}
              onToggleDropdown={() => toggleDropdown("term")}
              styles={style}
            />

            <CreditTargetSection
              selectedTarget={selectedTarget}
              onTargetSelect={handleTargetSelect}
              targetOptions={TARGETS}
              targetRef={targetRef}
              openDropdown={openDropdown}
              onToggleDropdown={() => toggleDropdown("target")}
              styles={style}
            />

            <CreditSalaryInput
              value={salary.displaySalary}
              error={salary.salaryError}
              onChange={salary.handleSalaryChange}
              onFocus={salary.handleSalaryFocus}
              onBlur={salary.handleSalaryBlur}
              onKeyDown={salary.handleKeyDown}
              styles={style}
            />
          </form>
        </div>

        {filesStatus === "succeeded" && (
          <CreditFooter
            filesData={filesData}
            onSubmit={handleSubmit}
            styles={style}
          />
        )}
      </div>
    </section>
  );
};

export default Credit;
