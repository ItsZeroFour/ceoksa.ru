import React, { useEffect, useRef } from "react";
import style from "./sequrity.module.scss";
import { ReactComponent as Checkbox } from "../../../assets/icons/checkbox.svg";
import { ReactComponent as Message } from "../../../assets/icons/message.svg";
import { ReactComponent as Phone } from "../../../assets/icons/phone.svg";
import { Link } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const Sequrity = () => {
  const listRef = useRef(null);
  const mobileRef = useRef(null);
  const roRef = useRef(null);

  const slidesData = [
    {
      id: 1,
      title: "Ваши персональные данные под защитой",
      content: (
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
      ),
    },
    {
      id: 2,
      title: "Правила безопасности для клиента",
      content: (
        <ol>
          <li>
            <div>
              <Message />
            </div>
            Мы не используем авторизацию по номеру телефона и не высылаем СМС
          </li>
          <li>
            <div>
              <Phone />
            </div>
            Наши сотрудники никогда не запрашивают код из СМС клиента
          </li>
          <li>
            <div>
              <Checkbox />
            </div>
            Никому не сообщайте свои персональные данные и код из СМС
          </li>
        </ol>
      ),
    },
    {
      id: 3,
      title: "Служба поддержки клиентов",
      content: (
        <>
          <p>
            Если к вам обратились от имени компании ОКСА с просьбой предоставить
            персональные данные или код из СМС, обратитесь в службу поддержки по
            официальному номеру
          </p>
          <div className={style.sequrity__item__contacts}>
            <p>Ежедневно с 9:00 до 21:00 по Москве</p>
            <Link to="tel:+74959200335">+7 495 920-03-35</Link>
          </div>
        </>
      ),
    },
  ];

  return (
    <section className={style.sequrity}>
      <div className="container">
        <div className={style.sequrity__wrapper}>
          <h2>Заботимся о вашей безопасности</h2>

          <ul className={style.sequrity__list_desktop} role="list">
            {slidesData.map((s) => (
              <li key={s.id} className={style.sequrity__item}>
                <h3>{s.title}</h3>
                {s.content}
              </li>
            ))}
          </ul>

          <div className={style.sequrity__slider_mobile}>
            <Swiper
              spaceBetween={15}
              slidesPerView={1.15}
              loop={true}
            >
              {slidesData.map((s) => (
                <SwiperSlide key={s.id} className={style.sequrity__item}>
                  {/* <div className={style.sequrity__slide_wrapper}> */}
                    <h3>{s.title}</h3>
                    {s.content}
                  {/* </div> */}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sequrity;
