import React from "react";
import style from "./advantages.module.scss";
import advantagesImg1 from "../../../assets/images/main/advantages-1.webp";
import advantagesImg2 from "../../../assets/images/main/advantages-2.webp";
import advantagesImg3 from "../../../assets/images/main/advantages-3.webp";

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

  return (
    <section className={style.advantages}>
      <div className="container">
        <div className={style.advantages__wrapper}>
          <ul>
            {advantagesData.map((item, index) => (
              <li key={index}>
                <p>
                  {item.lines.map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < item.lines.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
                <img src={item.image} loading="lazy" alt={item.alt} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Advantages;
