import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./repayment.module.scss";
import MobileLeftPanel from "../../../components/mobile_left_panel/MobileLeftPanel";
import BankSelectorModal from "../../../components/bank_selector_modal/BankSelectorModal";
import vtb from "../../../assets/icons/vtb.png";
import tbank from "../../../assets/icons/tbank.png";
import sovcombank from "../../../assets/icons/sovcombank.png";
import sber from "../../../assets/icons/sber.svg";
import sbp from "../../../assets/icons/account/sbp.png";
import Requisites from "../../../pages/account/credits/requisites/Requisites";

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

const SbpBadge = () => (
  <span className={style.sbp}>
    <img src={sbp} alt="sbp" />
  </span>
);

const CardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path d="M2 10h20" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M6 15h4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const ReceiptIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 3h10l4 4v14H5V3z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M14 3v5h5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M8 13h8M8 17h5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const BankBuildingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 10l9-6 9 6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M5 10v9M19 10v9M9 10v9M15 10v9"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M3 20h18"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const SBP_BANKS = [
  { id: "vtb", name: "ВТБ", logo: vtb, tile: "vtb" },
  { id: "tbank", name: "Т-Банк", logo: tbank, tile: "tbank" },
  { id: "sovcom", name: "Совкомбанк", logo: sovcombank, tile: "sovcom" },
  { id: "sber", name: "Сбербанк", logo: sber, tile: "sber" },
];

const Repayment = ({ setOpenMenu, openMenu }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequisitesOpen, setIsRequisitesOpen] = useState(false);

  const handleBankClick = (bank) => {
    navigate("/account/my-credits/sbp-transfer", {
      state: { sourceBank: bank },
    });
  };

  const handleOtherBank = () => setIsModalOpen(true);
  const handleCardPayment = () => navigate("/account/my-credits/card-transfer");
  const handleRequisitesPayment = () => setIsRequisitesOpen(true);
  const handleBankSelect = (bank) => {
    setIsModalOpen(false);
    navigate("/account/my-credits/sbp-transfer", {
      state: { sourceBank: bank },
    });
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

            <h1>Внести на погашение</h1>

            <div className={style.grid}>
              <section className={style.col}>
                <header className={style.col__head}>
                  <h2>Из другого банка</h2>
                  <SbpBadge />
                </header>
                <p className={style.col__subtitle}>Без комиссии</p>

                <ul className={style.banks}>
                  {SBP_BANKS.map((bank) => (
                    <li
                      key={bank.id}
                      className={`${style.bank} ${style[`bank_${bank.tile}`]}`}
                      onClick={() => handleBankClick(bank)}
                    >
                      <div className={style.bank__logo}>
                        <img src={bank.logo} alt={bank.name} />
                      </div>
                      <span className={style.bank__name}>{bank.name}</span>
                    </li>
                  ))}

                  <li
                    className={`${style.bank} ${style.bank_other}`}
                    onClick={handleOtherBank}
                  >
                    <div
                      className={`${style.bank__logo} ${style.bank__logo_inline}`}
                    >
                      <BankBuildingIcon />
                    </div>
                    <span className={style.bank__name}>Другой банк</span>
                  </li>
                </ul>
              </section>

              <section className={style.col}>
                <header className={style.col__head}>
                  <h2>Другие способы оплаты</h2>
                </header>
                <p className={style.col__subtitle}>
                  Возможна комиссия (зависит от способа пополнения)
                </p>

                <ul className={style.methods}>
                  <li className={style.method} onClick={handleCardPayment}>
                    <div className={style.method__icon}>
                      <CardIcon />
                    </div>
                    <span>Пополнить с карты</span>
                  </li>
                  <li
                    className={style.method}
                    onClick={handleRequisitesPayment}
                  >
                    <div className={style.method__icon}>
                      <ReceiptIcon />
                    </div>
                    <span>По реквизитам</span>
                  </li>
                </ul>
              </section>
            </div>
          </section>
        </div>
      </div>

      {isRequisitesOpen && (
        <Requisites
          showRequisites={isRequisitesOpen}
          setShowRequisites={setIsRequisitesOpen}
        />
      )}

      <BankSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleBankSelect}
      />
    </div>
  );
};

export default Repayment;
