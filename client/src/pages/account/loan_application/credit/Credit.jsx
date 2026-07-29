import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "./credit.module.scss";
import DropdownSelector from "../../../../components/dropdown_selector/DropdownSelector";
import Notification from "../../../../components/notification/Notification";
import CreditSceleton from "../../../../components/sceletons/CreditSceleton";
import CreditAmountInput from "../../../../components/credit/CreditAmountInput/CreditAmountInput";
import SalaryInput from "../../../../components/credit/SalaryInput/SalaryInput";
import CreditFormButtons from "../../../../components/credit/CreditFormButtons/CreditFormButtons";
import { useOutsideClick } from "../../../../hooks/useOutsideClick";
import { useDropdown } from "../../../../hooks/useDropdown";
import { useScreenWidth } from "../../../../hooks/useScreenWidth";
import { useCreditAmount } from "../../../../hooks/useCreditAmount";
import { useSalaryValidation } from "../../../../hooks/useSalaryValidation";
import { useDebouncedUpdate } from "../../../../hooks/useDebouncedUpdate";
import { fetchCredit } from "../../../../redux/slices/strapi/creditSlice";
import {
  updateUser,
  clearError,
} from "../../../../redux/slices/user/updateUserSlice";
import {
  TERMS,
  TARGETS,
  CREDIT_LIMITS,
  DRAFT_KEY,
} from "../../../../constants/creditConstants";
import { useNavigate } from "react-router-dom";

export const saveDraft = (data) => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
};

const Credit = ({ setOpenAuthMenu, openAuthMenu }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userChangedRef = useRef(false);

  const user = useSelector((state) => state.auth);
  const isAuthenticated = user?.isAuth ?? false;
  const authStatus = user?.status;

  const loanApplication = user?.user?.data?.loan_application;
  const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");

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
  const [isHydrated, setIsHydrated] = useState(false);

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

  const getCurrentFormData = () => ({
    sum: creditAmount.amountValue,
    date: selectedTerm.value,
    target: selectedTarget.value,
    salary: salary.salaryValue,
  });

  useEffect(() => {
    dispatch(fetchCredit("kredit?populate=*"));
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (isHydrated) return;

    const savedDraft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");

    if (savedDraft) {
      dispatch(clearError());
      dispatch(updateUser({ loan_application: savedDraft }));
      localStorage.removeItem(DRAFT_KEY);
    }

    setIsHydrated(true);
  }, [isAuthenticated, isHydrated, dispatch]);

  useEffect(() => {
    if (isAuthenticated) return;

    saveDraft(getCurrentFormData());
  }, [
    isAuthenticated,
    creditAmount.amountValue,
    selectedTerm,
    selectedTarget,
    salary.salaryValue,
  ]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isHydrated) return;
    if (!userChangedRef.current) return;

    debouncedUpdate(getCurrentFormData());
  }, [
    isAuthenticated,
    isHydrated,
    creditAmount.amountValue,
    selectedTerm,
    selectedTarget,
    salary.salaryValue,
  ]);

  useEffect(() => {
    if (authStatus !== "succeeded") return;
    if (!loanApplication) return;

    if (draft) return;

    const savedTerm = TERMS.find((t) => t.value === loanApplication.date);
    if (savedTerm) setSelectedTerm(savedTerm);

    const savedTarget = TARGETS.find((t) => t.value === loanApplication.target);
    if (savedTarget) setSelectedTarget(savedTarget);

    if (loanApplication.salary) {
      salary.setSalaryValue(loanApplication.salary);
    }

    // Сумма кредита тоже должна подтянуться из БД, иначе при монтировании
    // компонента до прихода auth-данных initialSum уходит в дефолт 500 000
    // и остаётся таким — другие поля тут обновляются через setSelected*,
    // а creditAmount без явного setAmountValue застревает.
    if (
      typeof loanApplication.sum === "number" &&
      loanApplication.sum !== creditAmount.amountValue
    ) {
      creditAmount.setAmountValue(loanApplication.sum);
    }
  }, [authStatus, loanApplication]);

  const handleTermSelect = (term) => {
    userChangedRef.current = true;
    setSelectedTerm(term);
    setOpenDropdown(null);
  };

  const handleTargetSelect = (target) => {
    userChangedRef.current = true;
    setSelectedTarget(target);
    setOpenDropdown(null);
  };

  // Оборачиваем handlers суммы и зарплаты, чтобы тоже взводить
  // userChangedRef → debouncedUpdate начинает работать после правок
  // этих полей (раньше срабатывал только после выбора срока/цели).
  const handleAmountChangeWrapped = (e) => {
    userChangedRef.current = true;
    creditAmount.handleAmountChange(e);
  };
  const handleAmountIncrement = () => {
    userChangedRef.current = true;
    creditAmount.increment();
  };
  const handleAmountDecrement = () => {
    userChangedRef.current = true;
    creditAmount.decrement();
  };
  const handleSalaryChangeWrapped = (e) => {
    userChangedRef.current = true;
    salary.handleSalaryChange(e);
  };

  const handleContinue = async () => {
    window.ym(111120961, "reachGoal", "zayavka-accaunt");
    if (!salary.salaryValue || salary.salaryError) {
      salary.handleSalaryBlur();
      return;
    }

    if (isAuthenticated) {
      dispatch(clearError());
      // Дожидаемся ответа сервера ДО navigate — иначе reload/navigate
      // мог обрывать запрос на лету и сумма не успевала сохраниться.
      try {
        await dispatch(
          updateUser({ loan_application: getCurrentFormData() })
        ).unwrap();
      } catch (err) {
        console.warn("[handleContinue] updateUser failed:", err);
      }
      navigate("/account/loan_applications");
    } else {
      saveDraft(getCurrentFormData());
      setOpenAuthMenu(true);
    }
  };

  if (status === "loading" || status === "failed") {
    return (
      <section className={style.credit} id="credit">
        <CreditSceleton />
      </section>
    );
  }

  const handleMouseDown = (e) => {
    e.preventDefault();
  };

  return (
    <section className={style.credit} id="credit">
      <div className={style.credit__wrapper}>
        <h2 className={style.credit__title}>
          Укажите сумму, сроки и цель вашего кредита
        </h2>
        {/* <p className={style.credit__desc}>{data.description}</p> */}

        <div className={style.credit__main}>
          <form
            className="credit__main__form"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="credit__main__form__elem">
              <CreditAmountInput
                value={creditAmount.displayAmount}
                onChange={handleAmountChangeWrapped}
                onFocus={creditAmount.handleAmountFocus}
                onBlur={creditAmount.handleAmountBlur}
                onIncrement={handleAmountIncrement}
                onDecrement={handleAmountDecrement}
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
                onChange={handleSalaryChangeWrapped}
                onFocus={salary.handleSalaryFocus}
                onBlur={salary.handleSalaryBlur}
                onKeyDown={salary.handleKeyDown}
              />
            </div>

            <div className={style.credit__button}>
              <button
                type="button"
                className={style.credit__buttons__continue}
                onMouseDown={handleMouseDown}
                onClick={handleContinue}
              >
                Продолжить
              </button>
            </div>
          </form>

          {/* <Notification text="Авторизация через Госуслуги находится в процессе разработки и скоро будет доступна" /> */}
        </div>
      </div>
    </section>
  );
};

export default Credit;
