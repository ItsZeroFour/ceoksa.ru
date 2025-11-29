import React from "react";
import { motion } from "framer-motion"; // ← добавлен импорт
import style from "./stats.module.scss";
import rocket from "../../../../assets/images/account/rocket.png";
import SemiCircleProgress from "../../../../components/semi_circle_progress/SemiCircleProgress";
import { container, item } from "../../../../animations/rating-stats";
import { useScreenWidth } from "../../../../hooks/useScreenWidth";

const Stats = () => {
  const screenWidth = useScreenWidth();
  const isMobile = screenWidth <= 520;

  return (
    <section className={style.stats}>
      <div className={style.stats__wrapper}>
        <motion.div
          className={style.stats__top}
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div className={style.stats__left} vaxqriants={item}>
            <SemiCircleProgress value={950} total={1000} />
          </motion.div>

          <motion.div className={style.stats__right} variants={item}>
            <div className={style.stats__right__main}>
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Хороший
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Чем выше рейтинг, тем больше шансов на одобрение кредита Банком
              </motion.p>
            </div>

            <motion.div
              className={style.stats__right__date}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className={style.stats__right__date__item}>
                <p>Рейтинг обновлен</p>
                <div className={style.stats__right__date__info}>
                  <p>11 ноября 2025</p>
                  <p>2 дня назад</p>
                </div>
              </div>

              <div className={style.stats__right__date__item}>
                <p>Рейтинг обновлен</p>
                <div className={style.stats__right__date__info}>
                  <p>11 ноября 2025</p>
                  <p>2 дня назад</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className={style.stats__bottom}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.div
            className={style.stats__bottom__item}
            // whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <p>Ваш рейтинг лучше, чем у 90% клиентов OKCA</p>
            <motion.img
              src={rocket}
              alt="rocket"
              initial={{ rotate: -20, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            />
          </motion.div>

          <motion.div
            className={style.stats__bottom__item}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <ul className={style.stats__bottom__item__list}>
              {[...Array(3)].map((_, i) => (
                <motion.li
                  key={i}
                  className={style.stats__bottom__item__list__item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                >
                  {i === 0 && (
                    <>
                      <p>Всего {isMobile ? null : <br />} кредитов</p>
                      <div className={style.stats__bottom__item__list__number}>
                        2
                      </div>
                    </>
                  )}
                  {i === 1 && (
                    <>
                      <p>Просрочки {isMobile ? null : <br />} по кредитам</p>
                      <div className={style.stats__bottom__item__list__number}>
                        нет
                      </div>
                    </>
                  )}
                  {i === 2 && (
                    <>
                      <p>Общая {isMobile ? null : <br />} сумма долга</p>
                      <div className={style.stats__bottom__item__list__number}>
                        1 204 658,76 ₽
                      </div>
                    </>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;
