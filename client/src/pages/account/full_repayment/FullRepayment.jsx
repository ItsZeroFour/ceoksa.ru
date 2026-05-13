import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import style from "./fullrepayment.module.scss";
import MobileLeftPanel from "../../../components/mobile_left_panel/MobileLeftPanel";
import InfoModal from "../../../components/info_modal/InfoModal";

const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M9 12L4 7l5-5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const formatMoney = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return (
    new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " ₽"
  );
};

const FullRepayment = ({ setOpenMenu, openMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // mock: реально брать из API по creditId из location.state
  const debtAmount = location.state?.balance ?? 1937453.45;

  const handleSubmit = () => {
    setIsSuccessOpen(true);
  };

  const handleCloseSuccess = () => {
    setIsSuccessOpen(false);
    navigate("/account/my-credits");
  };

  return (
    <div className={style.page}>
      <div className="container">
        <div className={style.wrapper}>
          <MobileLeftPanel setOpenMenu={setOpenMenu} openMenu={openMenu} />

          <section className={style.main}>
            <button
              type="button"
              className={style.back}
              onClick={() => navigate(-1)}
            >
              <Chevron />
              <span>Назад</span>
            </button>

            <h1>Погасить весь долг</h1>

            <section className={style.col}>
              <header className={style.col__head}>
                <h2>Сумма с учетом процентов</h2>
              </header>

              <div className={style.amount}>
                <p className={style.amount__label}>Долг с учетом процентов</p>
                <p className={style.amount__value}>{formatMoney(debtAmount)}</p>
              </div>
            </section>

            <button
              type="button"
              className={style.submit}
              onClick={handleSubmit}
            >
              Внести платеж
            </button>
          </section>
        </div>
      </div>

      <InfoModal
        isOpen={isSuccessOpen}
        onClose={handleCloseSuccess}
        title="Заявление сформировано"
      >
        <p>
          Мы оформили заявление на полное досрочное погашение кредита сегодня.
          Банк спишет всю сумму задолженности в течение дня.
        </p>
        <p>Пожалуйста, убедитесь, что на счёте достаточно средств.</p>
      </InfoModal>
    </div>
  );
};

export default FullRepayment;
