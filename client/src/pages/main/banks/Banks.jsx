import React, { useEffect, useRef, useState } from "react";
import style from "./banks.module.scss";
import { motion, useAnimation } from "framer-motion";
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

  const controls = useAnimation();
  const containerRef = useRef(null);
  const [duration, setDuration] = useState(20);

  useEffect(() => {
    const updateDuration = () => {
      if (window.innerWidth <= 710) {
        setDuration(13);
      } else {
        setDuration(20);
      }
    };

    updateDuration();

    const handleResize = () => {
      updateDuration();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const animate = async () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.scrollWidth / 2;

      controls.set({ x: 0 });
      await controls.start({
        x: -containerWidth,
        transition: {
          duration: duration,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      });
    };

    animate();
  }, [controls, duration]);

  return (
    <section className={style.banks}>
      <div className="container">
        <div className={style.banks__wrapper}>
          <h2>Банки-партнёры</h2>

          <div className={style.marquee} ref={containerRef}>
            <motion.ul className={style.marquee__content} animate={controls}>
              {[...bankLogos, ...bankLogos].map((bank, index) => (
                <li key={index} className={style.marquee__item}>
                  <img src={bank.src} alt={bank.alt} />
                </li>
              ))}
            </motion.ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banks;
