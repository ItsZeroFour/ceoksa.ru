import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./cardtransfer.module.scss";
import MobileLeftPanel from "../../../components/mobile_left_panel/MobileLeftPanel";
import tbank from "../../../assets/icons/tbank.png";

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

const formatCard = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const formatCvc = (raw) => raw.replace(/\D/g, "").slice(0, 3);

const formatAmount = (raw) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("ru-RU").format(Number(digits)) + " ₽";
};

const CardTransfer = ({ setOpenMenu, openMenu }) => {
  const navigate = useNavigate();
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [remember, setRemember] = useState(false);
  const [amount, setAmount] = useState("100 000 ₽");

  const targetCredit = {
    bank: { name: "Т-Банк", logo: tbank },
    productName: "Кредит наличными Т-Банк",
    accountMask: "*3742",
  };

  const isValid =
    card.replace(/\s/g, "").length >= 16 &&
    expiry.length === 5 &&
    cvc.length === 3 &&
    amount.trim();

  const handleTransfer = () => {
    if (!isValid) return;
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

            <h1>По номеру карты</h1>

            <div className={style.grid}>
              <section className={`${style.col} ${style.col_from}`}>
                <header className={style.col__head}>
                  <h2>Откуда перевести</h2>
                </header>

                <div className={style.field}>
                  <label htmlFor="card-number">Номер карты</label>
                  <input
                    id="card-number"
                    type="text"
                    inputMode="numeric"
                    value={card}
                    onChange={(e) => setCard(formatCard(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    autoComplete="cc-number"
                  />
                </div>

                <div className={style.row}>
                  <div className={style.field}>
                    <label htmlFor="card-expiry">Срок</label>
                    <input
                      id="card-expiry"
                      type="text"
                      inputMode="numeric"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="ММ/ГГ"
                      autoComplete="cc-exp"
                    />
                  </div>
                  <div className={style.field}>
                    <label htmlFor="card-cvc">CVC</label>
                    <input
                      id="card-cvc"
                      type="password"
                      inputMode="numeric"
                      value={cvc}
                      onChange={(e) => setCvc(formatCvc(e.target.value))}
                      placeholder="***"
                      autoComplete="cc-csc"
                    />
                  </div>
                </div>

                <label className={style.toggle}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className={style.toggle__track}>
                    <span className={style.toggle__thumb} />
                  </span>
                  <span className={style.toggle__label}>Запомнить карту</span>
                </label>
              </section>

              <section className={`${style.col} ${style.col_to}`}>
                <header className={style.col__head}>
                  <h2>Куда перевести</h2>
                </header>

                <div className={style.target}>
                  <div className={style.target__logo}>
                    <img
                      src={targetCredit.bank.logo}
                      alt={targetCredit.bank.name}
                    />
                  </div>
                  <div className={style.target__text}>
                    <p className={style.target__label}>
                      {targetCredit.productName}{" "}
                      <span className={style.target__mask}>
                        {targetCredit.accountMask}
                      </span>
                    </p>
                    <p className={style.target__value}>
                      {targetCredit.bank.name}
                    </p>
                  </div>
                </div>
              </section>

              <section className={`${style.col} ${style.col_amount}`}>
                <header className={style.col__head}>
                  <h2>Сумма</h2>
                </header>

                <div className={style.amount}>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(formatAmount(e.target.value))}
                    placeholder="Сумма, ₽"
                    inputMode="numeric"
                  />
                </div>
                <p className={style.amount__hint}>
                  Без комиссии/или размер комиссии
                </p>
              </section>
            </div>

            <button
              type="button"
              className={style.submit}
              onClick={handleTransfer}
              disabled={!isValid}
            >
              Перевести
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CardTransfer;
