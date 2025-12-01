import React from "react";
import LeftPanel from "../../../components/left_panel/LeftPanel";
import MobileLeftPanel from "../../../components/mobile_left_panel/MobileLeftPanel";
import Stats from "./stats/Stats";
import Payments from "./payments/Payments";
import MyCredits from "./my_credits/MyCredits";

const Rating = ({ setOpenMenu, openMenu }) => {
  return (
    <div className="rating">
      <div className="container">
        <div className="rating__wrapper">
          {/* <LeftPanel /> */}
          <MobileLeftPanel setOpenMenu={setOpenMenu} openMenu={openMenu} />

          <div className="rating__main">
            <Stats />
            <Payments />
            <MyCredits />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rating;
