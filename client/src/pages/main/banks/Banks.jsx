import React, { useEffect, useState } from "react";
import style from "./banks.module.scss";
import sber from "../../../assets/images/main/banks/sber.webp";
import vtb from "../../../assets/images/main/banks/vtb.webp";
import tbank from "../../../assets/images/main/banks/tbank.webp";
import alfa from "../../../assets/images/main/banks/alfa.webp";
import mkb from "../../../assets/images/main/banks/mkb.webp";
import sovkom from "../../../assets/images/main/banks/sovkom.webp";

const Banks = () => {
  const bankLogos = [
    { src: sber, alt: "Сбер банк" },
    { src: vtb, alt: "ВТБ" },
    { src: tbank, alt: "Т-банк" },
    { src: alfa, alt: "Алфа-банк" },
    { src: mkb, alt: "МКБ" },
    { src: sovkom, alt: "Совкомбанк" },
  ];

  const [duration, setDuration] = useState(20);

  useEffect(() => {
    const updateDuration = () => {
      const baseSpeed = window.innerWidth <= 768 ? 15 : 30;
      const totalLogos = bankLogos.length * 2;
      const speedFactor = Math.max(1, totalLogos / 6);
      setDuration(baseSpeed * speedFactor);
    };

    updateDuration();
    window.addEventListener("resize", updateDuration);

    return () => window.removeEventListener("resize", updateDuration);
  }, [bankLogos.length]);

  return (
    <section className={style.banks}>
      <div className="container">
        <div className={style.banks__wrapper}>
          <h2>Банки-партнёры</h2>
          <div className={style.marquee}>
            <ul
              className={style.marquee__content}
              style={{
                animationDuration: `${duration}s`,
                transform: `translate3d(0, 0, 0)`,
              }}
            >
              {Array(6)
                .fill(0)
                .map((_, setIndex) =>
                  bankLogos.map((bank, logoIndex) => (
                    <li
                      key={`${setIndex}-${logoIndex}`}
                      className={style.marquee__item}
                      style={{ willChange: "transform" }}
                    >
                      <img src={bank.src} alt={bank.alt} />
                    </li>
                  ))
                )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banks;
