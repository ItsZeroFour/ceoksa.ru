import React from "react";
import style from "./sequrity.module.scss";
import { ReactComponent as Checkbox } from "../../../assets/icons/checkbox.svg";
import { ReactComponent as Message } from "../../../assets/icons/message.svg";
import { ReactComponent as Phone } from "../../../assets/icons/phone.svg";
import { Link } from "react-router-dom";

const Sequrity = () => {
  return (
    <section className={style.sequrity}>
      <div className="container">
        <div className={style.sequrity__wrapper}>
          <h2>Заботимся о вашей безопасности</h2>

          <ul>
            <li>
              <h3>Ваши персональные данные под защитой</h3>

              <ol>
                <li>
                  <div>
                    <Checkbox />
                  </div>
                  Мы следим за информационной безопасностью
                </li>
                <li>
                  <div>
                    <Checkbox />
                  </div>
                  Все данные передаются в зашифрованном виде
                </li>
                <li>
                  <div>
                    <Checkbox />
                  </div>
                  Включены в реестр операторов персональных данных Роскомнадзора
                </li>
              </ol>
            </li>

            <li>
              <h3>Правила безопасности для клиента</h3>

              <ol>
                <li>
                  <div>
                    <Message />
                  </div>
                  Мы не используем авторизацию по номеру телефона и не высылаем
                  СМС
                </li>
                <li>
                  <div>
                    <Phone />
                  </div>
                  Наши сотрудники никогда не запрашивают код из СМС клиента
                </li>
                <li>
                  <div>
                    <Checkbox />
                  </div>
                  Никому не сообщаете свои персональные данные и код из СМС
                </li>
              </ol>
            </li>

            <li>
              <h3>Служба поддержки клиентов</h3>

              <p>
                Если к вам обратились от имени компании ОКСА с просьбой
                предоставить персональные данные или код из СМС, обратитесь
                в службу поддержки по официальному номеру
              </p>

              <div className={style.sequrity__item__contacts}>
                <p>Ежедневно с 9:00 до 21:00 по Москве</p>
                <Link to="tel:+74959200335">+7 495 920-03-35</Link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Sequrity;
