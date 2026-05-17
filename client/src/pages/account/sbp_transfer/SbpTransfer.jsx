import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import style from "./sbptransfer.module.scss";
import MobileLeftPanel from "../../../components/mobile_left_panel/MobileLeftPanel";
import tbank from "../../../assets/icons/tbank.png";
import sbp from "../../../assets/icons/account/sbp.png";

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

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M5 12l5-5-5-5"
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

const formatAmount = (raw) => {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("ru-RU").format(Number(digits)) + " ₽";
};

const buildHolderName = (userData) => {
  if (!userData) return "Имя Ф.";
  const first =
    userData.firstName ||
    userData.first_name ||
    userData.fullName ||
    userData.name ||
    userData.fname;
  const last =
    userData.lastName ||
    userData.last_name ||
    userData.surname ||
    userData.lname;
  if (!first) return "Имя Ф.";
  if (!last) return first;
  return `${first} ${last[0]}.`;
};

const SbpTransfer = ({ setOpenMenu, openMenu, userData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sourceBank = location.state?.sourceBank ?? null;

  const [amount, setAmount] = useState("0 ₽");

  // Если пользователь зашёл на /sbp-transfer без выбранного банка — отправляем его выбирать
  useEffect(() => {
    if (!sourceBank) {
      navigate("/account/my-credits/repayment", { replace: true });
    }
  }, [sourceBank, navigate]);

  if (!sourceBank) return null;

  const holderName = buildHolderName(userData);

  // TODO: подтянуть из state роута / store по creditId, сейчас захардкожено
  const targetCredit = {
    bank: { name: "Т-Банк", logo: tbank },
    productName: "Кредит наличными Т-Банк",
    accountMask: "*3742",
  };

  const handleAmountChange = (e) => {
    setAmount(formatAmount(e.target.value));
  };

  const handleTransfer = () => {
    if (!amount.trim()) return;
    navigate("/account/my-credits");
  };

  const handleChangeSourceBank = () => {
    navigate("/account/my-credits/repayment");
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

            <h1>С моего счета через СБП</h1>

            <div className={style.grid}>
              <section className={`${style.col} ${style.col_from}`}>
                <header className={style.col__head}>
                  <h2>Откуда перевести</h2>
                  <SbpBadge />
                </header>

                <button
                  type="button"
                  className={style.card}
                  onClick={handleChangeSourceBank}
                >
                  <BankLogo bank={sourceBank} />
                  <div className={style.card__text}>
                    <p className={style.card__label}>{holderName}</p>
                    <p className={style.card__value}>
                      Со счета {sourceBank.name}
                    </p>
                  </div>
                  <span className={style.card__chevron}>
                    <ChevronRight />
                  </span>
                </button>
              </section>

              <section className={`${style.col} ${style.col_to}`}>
                <header className={style.col__head}>
                  <h2>Куда перевести</h2>
                </header>

                <div className={`${style.card} ${style.card_static}`}>
                  <div className={style.card__logo}>
                    <img
                      src={targetCredit.bank.logo}
                      alt={targetCredit.bank.name}
                    />
                  </div>
                  <div className={style.card__text}>
                    <p className={style.card__label}>
                      {targetCredit.productName}{" "}
                      <span className={style.card__mask}>
                        {targetCredit.accountMask}
                      </span>
                    </p>
                    <p className={style.card__value}>
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
                    onChange={handleAmountChange}
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
              disabled={!amount.trim()}
            >
              Перевести
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

const BankLogo = ({ bank }) => {
  if (bank.logo) {
    return (
      <div className={style.card__logo}>
        <img src={bank.logo} alt={bank.name} />
      </div>
    );
  }

  return (
    <div
      className={style.card__logo_placeholder}
      style={{ background: bank.color, color: bank.textColor }}
    >
      {bank.initial ?? bank.name?.[0] ?? "?"}
    </div>
  );
};

export default SbpTransfer;
