import React, { useState } from "react";
import style from "./mycredits.module.scss";
import MobileLeftPanel from "../../../components/mobile_left_panel/MobileLeftPanel";
import Active from "./active/Active";
import Archive from "./archive/Archive";

const MyCredits = ({ setOpenMenu, openMenu }) => {
  const [tab, setTab] = useState("active");

  return (
    <div className={style.page}>
      <div className="container">
        <div className={style.wrapper}>
          <MobileLeftPanel setOpenMenu={setOpenMenu} openMenu={openMenu} />

          <section className={style.main}>
            <h1>Кредиты</h1>

            <div className={style.tabs}>
              <button
                type="button"
                className={`${style.tabs__btn} ${
                  tab === "active" ? style.tabs__btn_active : ""
                }`}
                onClick={() => setTab("active")}
              >
                Активные
              </button>
              <button
                type="button"
                className={`${style.tabs__btn} ${
                  tab === "archive" ? style.tabs__btn_active : ""
                }`}
                onClick={() => setTab("archive")}
              >
                Архив
              </button>
            </div>

            {tab === "active" ? <Active /> : <Archive />}
          </section>
        </div>
      </div>
    </div>
  );
};

export default MyCredits;
