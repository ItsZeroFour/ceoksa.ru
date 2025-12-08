import React, { useEffect, useState } from "react";
import style from "./banks.module.scss";
import sber from "../../../assets/images/main/banks/sber.webp";
import vtb from "../../../assets/images/main/banks/vtb.webp";
import tbank from "../../../assets/images/main/banks/tbank.webp";
import alfa from "../../../assets/images/main/banks/alfa.webp";
import mkb from "../../../assets/images/main/banks/mkb.webp";
import sovkom from "../../../assets/images/main/banks/sovkom.webp";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanks } from "../../../redux/slices/strapi/banksSlice";
import BanksSceleton from "../../../components/sceletons/BanksSelector";

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

  const dispatch = useDispatch();

  const { data, status, error } = useSelector((state) => state.banks);

  useEffect(() => {
    dispatch(fetchBanks("banki-partnery?populate=banks.logo"));
  }, [dispatch]);

  const isDataReady =
    status === "succeeded" &&
    data?.banks &&
    Array.isArray(data.banks) &&
    data.banks.length > 0 &&
    data?.title;

  useEffect(() => {
    if (isDataReady) {
      const updateDuration = () => {
        const baseSpeed = window.innerWidth <= 768 ? 15 : 30;
        const totalLogos = data.banks.length * 2;
        const speedFactor = Math.max(1, totalLogos / 6);
        setDuration(baseSpeed * speedFactor);
      };

      updateDuration();
      window.addEventListener("resize", updateDuration);

      return () => window.removeEventListener("resize", updateDuration);
    }
  }, [isDataReady]);

  console.log(data);

  return (
    <section className={style.banks}>
      <div className="container">
        {!isDataReady ? (
          <BanksSceleton />
        ) : (
          <div className={style.banks__wrapper}>
            <h2>{data.title}</h2>
            <div className={style.marquee}>
              <ul
                className={style.marquee__content}
                style={{
                  animationDuration: `${duration}s`,
                  transform: `translate3d(0, 0, 0)`,
                }}
              >
                {[...data.banks, ...data.banks].map((bank, logoIndex) => (
                  <li
                    key={`${logoIndex}`}
                    className={style.marquee__item}
                    style={{ willChange: "transform" }}
                  >
                    <img
                      src={`${process.env.REACT_APP_ADMIN_IMAGES}${bank.logo.url}`}
                      alt=""
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Banks;
