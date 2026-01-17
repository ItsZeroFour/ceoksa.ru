import React from "react";
import style from "./accept.module.scss";
import { Link } from "react-router-dom";
import { ReactComponent as File } from "../../../../assets/icons/profile/file.svg";

const files = [
  {
    path: "/soglasie-na-obrabotku-personalnyh-dannyh",
    text: "Согласие на обработку персональных данных",
  },

  {
    path: "/soglasie-na-poluchenie-reklamy",
    text: "Согласие на получение рекламы",
  },

  {
    path: "/",
    text: "Политика конфиденциальности",
  },

  {
    path: "/",
    text: "Правила ЭДО",
  },

  {
    path: "/",
    text: "Заявление на присоединение к правилам платформы",
  },

  {
    path: "/",
    text: "Правила финансовой платформы АО “Название платформы”",
  },

  {
    path: "/",
    text: "Согласие на обработку ПД Финансовыми организациями-партнерами",
  },

  {
    path: "/",
    text: "Согласие на получение информации из БКИ Финансовыми организациями и Финансовыми организациями-партнерами",
  },

  {
    path: "/",
    text: "Согласие на обработку ПД Финансовыми организациями",
  },

  {
    path: "/",
    text: "Согласие на получение информации из БКИ для Оператора финансовой платформы",
  },

  {
    path: "/",
    text: "Согласие на обработку ПД Оператором финансовой платформы",
  },
];

const Accept = () => {
  return (
    <div className={style.accept}>
      <div className={style.accept__wrapper}>
        <h2>Согласия</h2>

        <ul>
          {files.map(({ path, text }) => (
            <li>
              <Link to={path}>
                <div className={style.accept__item__icon}>
                  <File />
                </div>

                <p>{text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <button>Удалить профиль и данные</button>
    </div>
  );
};

export default Accept;
