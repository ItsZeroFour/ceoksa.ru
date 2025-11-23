import React, { useEffect, useState } from "react";
import style from "./banks.module.scss";
import sber from "../../../assets/images/main/banks/sber.png";
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
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Проверка prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = () => setIsReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Расчет скорости в зависимости от ширины
  useEffect(() => {
    const updateDuration = () => {
      const baseSpeed = window.innerWidth <= 768 ? 15 : 30;
      // Динамический расчет скорости в зависимости от количества логотипов
      const totalLogos = bankLogos.length * 2; // Два набора для плавного зацикливания
      const speedFactor = Math.max(1, totalLogos / 6); // Коэффициент для адаптации под разное количество логотипов
      setDuration(baseSpeed * speedFactor);
    };

    updateDuration();
    window.addEventListener("resize", updateDuration);

    return () => window.removeEventListener("resize", updateDuration);
  }, [bankLogos.length]);

  // Генерация контента с правильным количеством копий
  const generateLogos = () => {
    const doubledLogos = [...bankLogos, ...bankLogos];
    const totalWidth = doubledLogos.length * 200; // Приблизительная ширина (200px на логотип)
    const containerWidth = window.innerWidth || 1200;

    // Добавляем копии пока контент не заполнит 200% ширины контейнера
    const clonesNeeded = Math.max(
      2,
      Math.ceil((containerWidth * 2) / totalWidth)
    );
    return Array(clonesNeeded).fill(doubledLogos).flat();
  };

  return (
    <section className={style.banks}>
      <div className="container">
        <div className={style.banks__wrapper}>
          <h2>Банки-партнёры</h2>
          <div className={style.marquee}>
            <ul
              className={style.marquee__content}
              style={{
                animationDuration: isReducedMotion ? "0s" : `${duration}s`,
                animationPlayState: isReducedMotion ? "paused" : "running",
              }}
            >
              {generateLogos().map((bank, index) => (
                <li
                  key={`${bank.alt}-${index}`}
                  className={style.marquee__item}
                >
                  <img
                    src={bank.src}
                    alt={bank.alt}
                    loading="lazy"
                    width="160"
                    height="60"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banks;
