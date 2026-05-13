import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./certificateorder.module.scss";
import MobileLeftPanel from "../../../components/mobile_left_panel/MobileLeftPanel";
import CertificateRequestModal from "../../../components/certificate_request_modal/CertificateRequestModal";

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

const DocIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 9V20.9925C21 21.5511 20.5552 22 20.0066 22H3.9934C3.44495 22 3 21.556 3 21.0082V2.9918C3 2.45531 3.44694 2 3.99826 2H14V8C14 8.55228 14.4477 9 15 9H21ZM21 7H16V2.00318L21 7Z"
      fill="currentColor"
    />
  </svg>
);

const CERTIFICATES = [
  {
    id: "debt",
    title: "О задолженности",
    description:
      "Справка содержит подробную информацию о задолженности по договору на дату ее получения",
  },
  {
    id: "schedule",
    title: "График платежей",
    description:
      "Справка содержит график предстоящих платежей по кредитному договору",
  },
  {
    id: "requisites",
    title: "Реквизиты счета",
    description:
      "Справка содержит реквизиты счета для внесения платежей по кредиту",
  },
];

const CertificateOrder = ({ setOpenMenu, openMenu, userData }) => {
  const navigate = useNavigate();
  const [activeCert, setActiveCert] = useState(null);

  const userEmail =
    userData?.email ?? userData?.user_email ?? userData?.contact_email ?? "";

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

            <h1>Заказ справок</h1>

            <section className={style.col}>
              <header className={style.col__head}>
                <h2>Выберите тип справки</h2>
              </header>

              <ul className={style.list}>
                {CERTIFICATES.map((cert) => (
                  <li
                    key={cert.id}
                    className={style.item}
                    onClick={() => setActiveCert(cert)}
                  >
                    <div className={style.item__icon}>
                      <DocIcon />
                    </div>
                    <span className={style.item__title}>{cert.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          </section>
        </div>
      </div>

      <CertificateRequestModal
        certificate={activeCert}
        email={userEmail}
        onClose={() => setActiveCert(null)}
      />
    </div>
  );
};

export default CertificateOrder;
