import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import style from "./partialrepayment.module.scss";
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

const RECALC_OPTIONS = [
  { id: "term", label: "Уменьшить срок" },
  { id: "payment", label: "Уменьшить платеж" },
];

const formatAmount = (raw) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "0 ₽";
  return new Intl.NumberFormat("ru-RU").format(Number(digits)) + " ₽";
};

const MONTHS_GEN = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];
const MONTHS_NOM = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];

const PartialRepayment = ({ setOpenMenu, openMenu }) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("0 ₽");
  const [recalc, setRecalc] = useState("term");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const amountNum = Number(amount.replace(/\D/g, ""));
  const hasAmount = amountNum > 0;

  /* Mock даты — реально брать из API пересчёта */
  const newTerm = "январь 2028 г.";
  const oldTerm = "март 2028 г.";

  const recalcDescription = useMemo(() => {
    if (recalc === "term") return "Уменьшится срок кредита";
    return "Уменьшится ежемесячный платёж";
  }, [recalc]);

  const today = new Date();
  const todayString = `${today.getDate()} ${
    MONTHS_GEN[today.getMonth()]
  } ${today.getFullYear()} г.`;

  const handleSubmit = () => {
    if (!hasAmount) return;
    setIsSubmitOpen(true);
  };

  const handleCloseSubmit = () => {
    setIsSubmitOpen(false);
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

            <h1>Погасить частично</h1>

            <section className={style.col}>
              <header className={style.col__head}>
                <h2>Укажите сумму, и тип пересчета графика</h2>
              </header>

              <div className={style.amount}>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(formatAmount(e.target.value))}
                  onFocus={(e) => {
                    if (e.target.value === "0 ₽") setAmount("");
                  }}
                  onBlur={(e) => {
                    if (!e.target.value.trim()) setAmount("0 ₽");
                  }}
                  inputMode="numeric"
                  placeholder="Введите сумму для частично-досрочного погашения"
                />
              </div>

              <div className={style.options}>
                {RECALC_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`${style.option} ${
                      recalc === opt.id ? style.option_active : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="recalc"
                      value={opt.id}
                      checked={recalc === opt.id}
                      onChange={() => setRecalc(opt.id)}
                    />
                    <span className={style.option__radio}>
                      <span className={style.option__radio_dot} />
                    </span>
                    <span className={style.option__label}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className={style.summary}>
              <p className={style.summary__title}>
                Новый срок кредита {newTerm}{" "}
                <span className={style.summary__old}>{oldTerm}</span>
              </p>
              <p className={style.summary__sub}>{recalcDescription}</p>
            </section>

            <button
              type="button"
              className={style.submit}
              onClick={handleSubmit}
              disabled={!hasAmount}
            >
              Внести платеж
            </button>
          </section>
        </div>
      </div>

      <InfoModal
        isOpen={isSubmitOpen}
        onClose={handleCloseSubmit}
        title="Заявление сформировано"
      >
        <p>
          Мы подготовили заявление на досрочное погашение. Платёж будет выполнен
          сегодня, {todayString}
        </p>
        <p>
          Пожалуйста, пополните счёт — до 18:00 (МСК), чтобы средств было
          достаточно для списания.
        </p>
      </InfoModal>
    </div>
  );
};

export default PartialRepayment;
