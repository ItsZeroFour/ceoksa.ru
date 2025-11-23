import React, { useEffect, useRef, useState } from "react";
import style from "./banks.module.scss";
import { motion } from "framer-motion";
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

  const contentRef = useRef(null);
  const [duration, setDuration] = useState(20);

  useEffect(() => {
    const updateDuration = () => {
      setDuration(window.innerWidth <= 710 ? 13 : 20);
    };
    updateDuration();
    window.addEventListener("resize", updateDuration);
    return () => window.removeEventListener("resize", updateDuration);
  }, []);

  return (
    <section className={style.banks}>
      <div className="container">
        <div className={style.banks__wrapper}>
          <h2>Банки-партнёры</h2>

          <div className={style.marquee}>
            <motion.ul
              className={style.marquee__content}
              ref={contentRef}
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: duration,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
              }}
            >
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
