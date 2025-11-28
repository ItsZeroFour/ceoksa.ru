import React from "react";
import style from "./archive.module.scss";

const Archive = () => {
  return (
    <section className={style.archive}>
      <div className={style.archive__wrapper}>
        <h2>Здесь будут отображаться завершенные заявки</h2>
        <p>
          Когда вы отправите заявку на кредит и получите решения от банков, они
          появятся здесь.
        </p>

        <button>Оставить заявку</button>
      </div>
    </section>
  );
};

export default Archive;
