import React from "react";
import style from "./service.module.scss";
import servicePhoneImg from "../../../assets/images/main/service_phone.png";
import serviceItemImg1 from "../../../assets/images/main/service-1.webp";
import serviceItemImg2 from "../../../assets/images/main/service-2.webp";
import serviceItemImg3 from "../../../assets/images/main/service-3.webp";

const Service = () => {
  const serviceItems = [
    {
      title: "Выгодно",
      description:
        "Более 30 банков предложат свои условия. Выбираете самую низкую ставку",
      img: serviceItemImg1,
      alt: "Выгодно",
    },
    {
      title: "Честно",
      description:
        "Рассмотрение заявки и получение денег от банка — онлайн не выходя из дома.",
      img: serviceItemImg2,
      alt: "Честно",
    },
    {
      title: "Быстро",
      description: "Без комиссии, скрытых платежей и переплат.",
      img: serviceItemImg3,
      alt: "Быстро",
    },
  ];

  return (
    <section className={style.service}>
      <div className="container">
        <div className={style.service__wrapper}>
          <div className={style.service__main}>
            <div className={style.service__text}>
              <h2>О нашем сервисе</h2>
              <p>
                Наш сервис разработан специально для получения кредита в банке
                на самых выгодных условиях. Работаем напрямую со всеми
                крупнейшими банками. Вам нужно заполнить заявку на получение
                кредита и указать нужную сумму. Заявка автоматически рассылается
                во все банки. В течение 5 минут вы получаете предложения банков
                и выбираете наиболее выгодные условия. Деньги из банка поступят
                онлайн на ваш счёт.
              </p>

              <p>
                Благодаря нам вы получаете самую низкую ставку по кредиту
                и экономите до 30%. Это гораздо выгоднее, чем обращаться в банк
                напрямую.
              </p>
            </div>

            <div className={style.service__image}>
              <img src={servicePhoneImg} alt="Сервис" />
            </div>
          </div>
        </div>
      </div>

      <ul className={style.service__list}>
        {serviceItems.map((item, index) => (
          <li key={index} className={style.service__item}>
            <div className={style.service__item__text}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <img src={item.img} alt={item.alt} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Service;
