import React, { useState } from "react";
import LeftPanel from "../../../components/left_panel/LeftPanel";
import Top from "./top/Top";
import Passport from "./passport/Passport";
import Address from "./address/Address";
import RealAddress from "./real_address/RealAddress";
import { motion, AnimatePresence } from "framer-motion";
import Contacts from "./contacts/Contacts";
import Credit from "./credit/Credit";
import MobileLeftPanel from "../../../components/mobile_left_panel/MobileLeftPanel";
import Birth from "./birth/Birth";
import PhotoPassport from "./photo_passport/PhotoPassport";
import PhotoWithPassport from "./photo_with_passport/PhotoWithPassport";
import AdditionalTelephone from "./additional_telephone/AdditionalTelephone";
import PlaceOfWork from "./place_of_work/PlaceOfWork";
import AdditionalData from "./additional_data/AdditionalData";
import Verification from "./verification/Verification";
import RimIdentification from "../../../components/rim_identification/RimIdentification";

const LoanApplication = ({ setOpenMenu, openMenu, userData }) => {
  const [isChecked, setIsChecked] = useState(true);

  return (
    <div className="loan_application">
      <div className="container">
        <div className="loan_application__wrapper">
          {/* <LeftPanel /> */}
          <MobileLeftPanel setOpenMenu={setOpenMenu} openMenu={openMenu} />

          <div className="loan_application__main">
            <h1>Заявка на кредит</h1>

            <Verification />
            <Top />

            <Passport />
            <Address isChecked={isChecked} setIsChecked={setIsChecked} />
            <AnimatePresence>
              {!isChecked && (
                <motion.div
                  key="real-address"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="animated-wrapper"
                >
                  <RealAddress />
                </motion.div>
              )}
            </AnimatePresence>
            <Contacts userData={userData} />
            <AdditionalTelephone userData={userData} />
            <PlaceOfWork />
            <AdditionalData />
            <PhotoPassport />
            {/* <PhotoWithPassport /> */}
            <Credit />
          </div>
        </div>
      </div>

      <RimIdentification />
    </div>
  );
};

export default LoanApplication;
