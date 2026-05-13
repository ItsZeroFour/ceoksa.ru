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
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.0049 10V20C22.0049 20.5523 21.5572 21 21.0049 21H3.00488C2.4526 21 2.00488 20.5523 2.00488 20V10H22.0049ZM22.0049 8H2.00488V4C2.00488 3.44771 2.4526 3 3.00488 3H21.0049C21.5572 3 22.0049 3.44771 22.0049 4V8ZM15.0049 16V18H19.0049V16H15.0049Z"
      fill="currentColor"
    />
  </svg>
);

const ReceiptIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 8L9.00319 2H19.9978C20.5513 2 21 2.45531 21 2.9918V21.0082C21 21.556 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5501 3 20.9932V8ZM10 3.5L4.5 9H10V3.5Z"
      fill="currentColor"
    />
  </svg>
);

const BankBuildingIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 20H22V22H2V20ZM4 12H6V19H4V12ZM9 12H11V19H9V12ZM13 12H15V19H13V12ZM18 12H20V19H18V12ZM2 7L12 2L22 7V11H2V7ZM12 8C12.5523 8 13 7.55228 13 7C13 6.44772 12.5523 6 12 6C11.4477 6 11 6.44772 11 7C11 7.55228 11.4477 8 12 8Z"
      fill="currentColor"
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
