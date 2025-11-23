import React from "react";
import style from "./head.module.scss";
import img from "../../../assets/images/main/head.webp";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationFrame,
} from "framer-motion";

const Head = ({ scrollToBlock }) => {
  const angle = useMotionValue(0);

  useAnimationFrame((t) => {
    const newAngle = (t / 8000) * Math.PI * 2;
    angle.set(newAngle);
  });

  const radius = 100;

  const x = useTransform(angle, (a) => Math.cos(a) * radius);
  const y = useTransform(angle, (a) => Math.sin(a) * radius);

  return (
    <section className={style.head}>
      <div className="container">
        <div className={style.head__wrapper}>
          <div className={style.head__text}>
            <h1>Кредитная биржа ОКСА. Экономия на кредите до 30%</h1>
            <p>Подберём кредит в любом банке на лучших условиях</p>

            <Link to="#" onClick={() => scrollToBlock("credit")}>
              Оставить заявку
            </Link>
          </div>

          <div className={style.head__img}>
            <motion.img
              src={img}
              alt="main"
              // animate={{
              //   x: [-20, 20, -20],
              // }}
              // transition={{
              //   duration: 10,
              //   repeat: Infinity,
              //   ease: "easeInOut",
              // }}
            />
          </div>

          <Link
            className={style.head__link__mobile}
            to="#"
            onClick={() => scrollToBlock("credit")}
          >
            Оставить заявку
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Head;
