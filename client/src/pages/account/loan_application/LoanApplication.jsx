import React from "react";
import LeftPanel from "../../../components/left_panel/LeftPanel";
import Top from "./top/Top";

const LoanApplication = () => {
  return (
    <div className="loan_application">
      <div className="container">
        <div className="loan_application__wrapper">
          <LeftPanel />

          <div className="loan_application__main">
            <Top />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;
