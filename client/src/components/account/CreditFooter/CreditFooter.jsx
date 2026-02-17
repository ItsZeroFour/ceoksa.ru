import React from "react";
import { Link } from "react-router-dom";

const CreditFooter = ({ filesData, onSubmit, styles }) => {
  return (
    <div className={styles.credit__bottom}>
      <button onClick={onSubmit} type="button">
        Направить в банки
      </button>
      <p>
        Нажимая кнопку «Направить в банки», Вы даете{" "}
        <Link
          to={`${process.env.REACT_APP_ADMIN_IMAGES}${filesData.terms_of_transfer_of_informationconsent.url}`}
          target="_blank"
        >
          согласия
        </Link>{" "}
        и принимаете{" "}
        <Link
          to={`${process.env.REACT_APP_ADMIN_IMAGES}${filesData.terms_of_information_transfer.url}`}
          target="_blank"
        >
          условия передачи информации
        </Link>
      </p>
    </div>
  );
};

export default CreditFooter;
