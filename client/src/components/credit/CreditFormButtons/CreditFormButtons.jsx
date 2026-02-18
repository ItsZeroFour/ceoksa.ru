import React from "react";
import gosuslugi from "../../../assets/gosuslugi.png";

const CreditFormButtons = ({ screenWidth, onContinue }) => {
  const handleMouseDown = (e) => {
    e.preventDefault();
  };

  const GosuslugiButton = () => (
    <button className="credit__main__form__auth" disabled type="button">
      <img src={gosuslugi} alt="Госуслуги" />
      Продолжить через Госуслуги
    </button>
  );

  const ContinueButton = () => (
    <button
      type="button"
      className="credit__buttons__continue"
      onMouseDown={handleMouseDown}
      onClick={onContinue}
    >
      Продолжить
    </button>
  );

  return (
    <div className="credit__buttons">
      {screenWidth >= 980 ? (
        <>
          <GosuslugiButton />
          <ContinueButton />
        </>
      ) : (
        <>
          <ContinueButton />
          <GosuslugiButton />
        </>
      )}
    </div>
  );
};

export default CreditFormButtons;
