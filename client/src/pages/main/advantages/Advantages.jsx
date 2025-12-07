import React, { useEffect } from "react";
import style from "./advantages.module.scss";
import advantagesImg1 from "../../../assets/images/main/advantages-1.webp";
import advantagesImg2 from "../../../assets/images/main/advantages-2.webp";
import advantagesImg3 from "../../../assets/images/main/advantages-3.webp";
import AdvantagesSceleton from "../../../components/sceletons/AdvantagesSceleton";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdvantages } from "../../../redux/slices/strapi/advantagesSlice";

const Advantages = () => {
  const advantagesData = [
    {
      lines: ["Одобрение", "без документов"],
      image: advantagesImg1,
      alt: "Одобрение без документов",
    },
    {
      lines: ["Без звонков", "из банка"],
      image: advantagesImg2,
      alt: "Без звонков из банка",
    },
    {
      lines: ["Гарантия низкой", "ставки"],
      image: advantagesImg3,
      alt: "Гарантия низкой ставки",
    },
  ];

  const dispatch = useDispatch();

  const { data, status, error } = useSelector((state) => state.advantages);

  useEffect(() => {
    dispatch(fetchAdvantages("preimushhestva?populate=advantages.image"));
  }, [dispatch]);

  return (
    <section className={style.advantages}>
      <div className="container">
        {status === "loading" || status === "failed" ? (
          <AdvantagesSceleton />
        ) : (
          <div className={style.advantages__wrapper}>
            <ul>
              {data?.advantages?.map((item, index) => (
                <li key={index}>
                  <p>
                    {item.title.split("\\n").map((line, i, arr) => (
                      <React.Fragment key={i}>
                        {line.trim()}
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                  <img
                    src={`${process.env.REACT_APP_ADMIN_IMAGES}${item.image.url}`}
                    loading="lazy"
                    alt={item.title}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default Advantages;
