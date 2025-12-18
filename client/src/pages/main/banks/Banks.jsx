import React, { useEffect, useRef } from "react";
import style from "./banks.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanks } from "../../../redux/slices/strapi/banksSlice";
import BanksSceleton from "../../../components/sceletons/BanksSelector";
import gsap from "gsap";

const SPEED = 200;

const Banks = () => {
  const dispatch = useDispatch();
  const { data, status } = useSelector((state) => state.banks);

  useEffect(() => {
    dispatch(fetchBanks("banki-partnery?populate=banks.logo"));
  }, [dispatch]);

  const isDataReady =
    status === "succeeded" &&
    data?.banks &&
    data.banks.length > 0 &&
    data?.title;

  const trackRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    if (!isDataReady) return;

    const track = trackRef.current;
    if (!track) return;

    const totalWidth = track.scrollWidth / 2;

    tweenRef.current = gsap.to(track, {
      x: `-=${totalWidth}`,
      duration: totalWidth / SPEED,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (x) => {
          const value = parseFloat(x);
          return `${value % totalWidth}px`;
        },
      },
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, [isDataReady]);

  return (
    <section className={style.banks}>
      <div className="container">
        {!isDataReady ? (
          <BanksSceleton />
        ) : (
          <div className={style.banks__wrapper}>
            <h2>{data.title}</h2>
            <div className={style.marquee}>
              <ul className={style.marquee__content} ref={trackRef}>
                {[...data.banks, ...data.banks].map((bank, i) => (
                  <li key={i} className={style.marquee__item}>
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
