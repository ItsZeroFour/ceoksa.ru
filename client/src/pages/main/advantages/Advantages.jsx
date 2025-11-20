import React from "react";
import style from "./advantages.module.scss";
import advantagesImg1 from "../../../assets/images/main/advantages-1.webp";
import advantagesImg2 from "../../../assets/images/main/advantages-2.webp";
import advantagesImg3 from "../../../assets/images/main/advantages-3.webp";

const Advantages = () => {
  return (
    <section className={style.advantages}>
      <div className="container">
        <div className={style.advantages__wrapper}>
          <ul>
            <li>
              <p>
                ⁠Одобрение <br />
                без документов
              </p>

              <img src={advantagesImg1} alt="⁠Одобрение без документов" />
            </li>

            <li>
              <p>
                ⁠Без звонков <br />
                из банка
              </p>

              <img src={advantagesImg2} alt="⁠Без звонков из банка" />
            </li>

            <li>
              <p>
                Гарантия низкой <br /> ставки
              </p>

              <img src={advantagesImg3} alt="Гарантия низкой ставки" />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Advantages;
