import React, { useEffect, useState } from "react";
import style from "./accept.module.scss";
import { Link } from "react-router-dom";
import { ReactComponent as File } from "../../../../assets/icons/profile/file.svg";
import { useDispatch, useSelector } from "react-redux";
import { fetchFiles } from "../../../../redux/slices/strapi/FilesSlide";
import axios from "../../../../utils/axios";
import { generateConsentPdf } from "../../../../utils/Generateconsentpdf";
import DeleteAccount from "../../../../components/delete_account/DeleteAccount";

const hasPassportData = (user) => {
  const p = user?.passport;
  if (!p) return false;

  return Boolean(
    p.series_number &&
      p.issued_by &&
      p.date &&
      user.fullName &&
      p.birth &&
      p.department_code &&
      p.gender &&
      p.place_of_birth
  );
};

const Accept = ({ user }) => {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.files);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchFiles("fajly?populate=*"));
  }, [dispatch]);

  const deleteUser = async () => {
    try {
      const response = await axios.delete("/user/delete");
      if (response.status === 200) {
        return setShowModal(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={style.accept}>
      {status === "succeeded" && !error && (
        <div className={style.accept__wrapper}>
          <h2>Согласия</h2>

          <ul>
            <li>
              <Link
                to={`${process.env.REACT_APP_ADMIN_IMAGES}${data.consent_to_the_processing_of_personal_data.url}`}
                target="_blank"
              >
                <div className={style.accept__item__icon}>
                  <File />
                </div>
                <p>Согласие на обработку персональных данных</p>
              </Link>
            </li>

            <li>
              <Link
                to={`${process.env.REACT_APP_ADMIN_IMAGES}${data.consent_to_receive_advertising.url}`}
                target="_blank"
              >
                <div className={style.accept__item__icon}>
                  <File />
                </div>
                <p>Согласие на получение рекламной информации</p>
              </Link>
            </li>

            <li>
              <Link
                to={`${process.env.REACT_APP_ADMIN_IMAGES}${data.terms_of_transfer_of_informationconsent.url}`}
                target="_blank"
              >
                <div className={style.accept__item__icon}>
                  <File />
                </div>
                <p>Согласие на просмотр кредитного отчета</p>
              </Link>
            </li>

            <li>
              <Link
                to={`${process.env.REACT_APP_ADMIN_IMAGES}${data.terms_of_information_transfer.url}`}
                target="_blank"
              >
                <div className={style.accept__item__icon}>
                  <File />
                </div>
                <p>Условия передачи информации</p>
              </Link>
            </li>

            <li>
              <Link
                to={`${process.env.REACT_APP_ADMIN_IMAGES}${data.agreement_on_the_use_of_a_simple_electronic_signature.url}`}
                target="_blank"
              >
                <div className={style.accept__item__icon}>
                  <File />
                </div>
                <p>Соглашение об использовании простой электронной подписи</p>
              </Link>
            </li>

            <li>
              <Link
                to={`${process.env.REACT_APP_ADMIN_IMAGES}${data.consent_to_the_processing_of_personal_data_by_telecom_operators.url}`}
                target="_blank"
              >
                <div className={style.accept__item__icon}>
                  <File />
                </div>
                <p>
                  Согласие на обработку персональных данных операторами связи
                </p>
              </Link>
            </li>

            {hasPassportData(user) && (
              <li>
                <button
                  type="button"
                  className={style.accept__file_button}
                  onClick={() => generateConsentPdf(user)}
                >
                  <div className={style.accept__item__icon}>
                    <File />
                  </div>
                  <p>
                    Согласие на обработку персональных данных оператором и
                    партнерами оператора
                  </p>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      <button onClick={deleteUser}>Удалить профиль и данные</button>
      {showModal && <DeleteAccount />}
    </div>
  );
};

export default Accept;
