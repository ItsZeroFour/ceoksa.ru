import React, { useState } from "react";
import LeftPanel from "../../../components/left_panel/LeftPanel";
import MobileLeftPanel from "../../../components/mobile_left_panel/MobileLeftPanel";
import Active from "./active/Active";
import Archive from "./archive/Archive";
import Requisites from "./requisites/Requisites";
import useDisableScroll from "../../../hooks/useDisableScroll";

const Credits = ({ setOpenMenu, openMenu }) => {
  const [creditTab, setCreditTab] = useState("active");
  const [showRequisites, setShowRequisites] = useState(false);

  useDisableScroll(showRequisites);

  return (
    <div className="credits">
      <div className="container">
        <div className="credits__wrapper">
          {/* <LeftPanel /> */}
          <MobileLeftPanel setOpenMenu={setOpenMenu} openMenu={openMenu} />

          <section className="credits__main">
            <h1>Кредиты</h1>

            <div className="credits__main__nav">
              <button
                className={creditTab === "active" ? "active" : ""}
                onClick={() => setCreditTab("active")}
              >
                Активная заявка
              </button>
              <button
                className={creditTab === "archive" ? "active" : ""}
                onClick={() => setCreditTab("archive")}
              >
                Архив
              </button>
            </div>

            {creditTab === "active" ? (
              <Active setShowRequisites={setShowRequisites} />
            ) : (
              <Archive />
            )}
          </section>

          {showRequisites && (
            <Requisites
              setShowRequisites={setShowRequisites}
              showRequisites={showRequisites}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Credits;
