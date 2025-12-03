import React, { useState } from "react";
import style from "./top.module.scss";
import Notification from "../../../../components/notification/Notification";
import camera from "../../../../assets/icons/account/camera.svg";
import gosuslugi from "../../../../assets/gosuslugi.png";
import { ReactComponent as Load } from "../../../../assets/icons/account/load.svg";
import { motion } from "framer-motion";

const Top = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <section className={style.top}>
      <div className={style.top__wrapper}>
        <h1>Заявка на кредит</h1>

        <div className={style.top__main}>
          <Notification text="Чтобы направить заявку, необходимо дозаполнить ваши персональные данные" />

          <div className={style.top__main__name}>
            <div className={style.top__main__name__avatar}>
              <div className={style.top__main__name__avatar__img}>
                <p>ФИ</p>
              </div>

              <button>
                <img src={camera} alt="Загрузить фото" />
              </button>
            </div>

            <div className={style.top__main__name__main}>
              <p>Фамилия Имя Отчество</p>

              <div className={style.top__main__name__main__data}>
                <div className={style.top__main__name__main__data__text}>
                  <img src={gosuslugi} alt="госуслуги" />
                  <p>Данные загружены 12 ноября 2025</p>
                </div>
                <motion.button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  whileTap={{ scale: 0.95 }}
                  className={isRefreshing ? style.refreshingButton : ""}
                >
                  <motion.div
                    animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                    transition={{
                      duration: 1,
                      repeat: isRefreshing ? Infinity : 0,
                      ease: "linear",
                    }}
                  >
                    <Load />
                  </motion.div>

                  {isRefreshing ? "Обновление..." : "Обновить данные"}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Top;
