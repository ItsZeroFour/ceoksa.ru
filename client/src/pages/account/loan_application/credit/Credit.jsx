import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "./credit.module.scss";
import { useOutsideClick } from "../../../../hooks/useOutsideClick";
import { useDropdown } from "../../../../hooks/useDropdown";
import { useCreditAmount } from "../../../../hooks/useCreditAmount";
import { useSalaryValidation } from "../../../../hooks/useSalaryValidation";
import { fetchFiles } from "../../../../redux/slices/strapi/FilesSlide";
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
  const [selectedTerm, setSelectedTerm] = useState(TERMS[5]);
  const [selectedTarget, setSelectedTarget] = useState(TARGETS[0]);

  const termRef = useRef(null);
  const targetRef = useRef(null);

  const dispatch = useDispatch();
  const { data: filesData, status: filesStatus } = useSelector(
    (state) => state.files
  );

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
    dispatch(fetchFiles("fajly?populate=*"));
  }, [dispatch]);

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
