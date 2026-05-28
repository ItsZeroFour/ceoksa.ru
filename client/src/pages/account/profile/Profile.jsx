import React from "react";
import LeftPanel from "../../../components/left_panel/LeftPanel";
import MobileLeftPanel from "../../../components/mobile_left_panel/MobileLeftPanel";
import Top from "./top/Top";
import Documents from "./documents/Documents";
import Automobiles from "./automobiles/Automobiles";
import Addresses from "./addresses/Addresses";
import Rekvisits from "./rekvisits/Rekvisits";
import Accept from "./accept/Accept";

const Profile = ({ userData }) => {
  return (
    <div className="profile">
      <div className="container">
        <div className="profile__wrapper">
          {/* <LeftPanel /> */}
          <MobileLeftPanel />

          <div className="profile__main">
            <Top user={userData} />
            <Documents user={userData} />
            {/* <Automobiles /> */}
            <Addresses user={userData} />
            <Rekvisits user={userData} />
            <Accept user={userData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
