import React, { useEffect } from "react";
import style from "./accept.module.scss";
import { Link } from "react-router-dom";
import { ReactComponent as File } from "../../../../assets/icons/profile/file.svg";
import { useDispatch, useSelector } from "react-redux";
import { fetchFiles } from "../../../../redux/slices/strapi/FilesSlide";

// const files = [
//   {
//     path: "/soglasie-na-obrabotku-personalnyh-dannyh",
//     text: "Согласие на обработку персональных данных",
//   },

//   {
//     path: "/soglasie-na-poluchenie-reklamy",
//     text: "Согласие на получение рекламы",
//   },

//   {
//     path: "/",
//     text: "Политика конфиденциальности",
//   },

//   {
//     path: "/",
//     text: "Правила ЭДО",
//   },

//   {
//     path: "/",
//     text: "Заявление на присоединение к правилам платформы",
//   },

//   {
//     path: "/",
//     text: "Правила финансовой платформы АО “Название платформы”",
//   },

//   {
//     path: "/",
//     text: "Согласие на обработку ПД Финансовыми организациями-партнерами",
//   },

//   {
//     path: "/",
//     text: "Согласие на получение информации из БКИ Финансовыми организациями и Финансовыми организациями-партнерами",
//   },

//   {
//     path: "/",
//     text: "Согласие на обработку ПД Финансовыми организациями",
//   },

//   {
//     path: "/",
//     text: "Согласие на получение информации из БКИ для Оператора финансовой платформы",
//   },

//   {
//     path: "/",
//     text: "Согласие на обработку ПД Оператором финансовой платформы",
//   },
// ];

const Accept = () => {
  const dispatch = useDispatch();

  const { data, status, error } = useSelector((state) => state.files);

  useEffect(() => {
    dispatch(fetchFiles("fajly?populate=*"));
  }, [dispatch]);

  console.log(data);

  return (
    <div className={style.accept}>
      {status === "succeeded" && !error && (
        <div className={style.accept__wrapper}>
          <h2>Согласия</h2>

          <ul>
            {/* {files.map(({ path, text }) => ( */}
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

                <p>Соглашение обиспользовании простой электронной подписи</p>
              </Link>
            </li>
            {/* ))} */}
          </ul>
        </div>
      )}

      <button>Удалить профиль и данные</button>
    </div>
  );
};

export default Accept;
