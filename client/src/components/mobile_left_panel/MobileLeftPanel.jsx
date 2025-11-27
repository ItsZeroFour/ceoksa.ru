import React, { useState } from "react";
import style from "../left_panel/leftpanel.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import { ReactComponent as Person } from "../../assets/icons/left_panel/person.svg";
import { ReactComponent as List } from "../../assets/icons/left_panel/list.svg";
import { ReactComponent as Money } from "../../assets/icons/left_panel/money.svg";
import { ReactComponent as Rate } from "../../assets/icons/left_panel/rate.svg";
import { ReactComponent as Profile } from "../../assets/icons/left_panel/profile.svg";
import { ReactComponent as Business } from "../../assets/icons/left_panel/business.svg";
import { ReactComponent as Angle } from "../../assets/icons/left_panel/angle.svg";
import { ReactComponent as SignOut } from "../../assets/icons/left_panel/signout.svg";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.svg";

const personalItems = [
  { icon: <List />, text: "Заявка на кредит", path: "/loan_applications" },
  { icon: <Money />, text: "Кредиты", path: "/credits" },
  { icon: <Rate />, text: "Кредитный рейтинг", path: "/rating" },
  { icon: <Profile />, text: "Профиль", path: "/profile" },
];

const businessItems = [];

const MobileLeftPanel = ({ setOpenMenu, openMenu }) => {
  const location = useLocation();
  const [isPersonalOpen, setIsPersonalOpen] = useState(true);
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);

  const togglePersonal = () => setIsPersonalOpen(!isPersonalOpen);
  const toggleBusiness = () => setIsBusinessOpen(!isBusinessOpen);

  const isActive = (path) => location.pathname === `/account${path}`;

  return (
    <div className={style.mobile_left_panel__main}>
      {/* Затемнение фона */}
      <AnimatePresence>
        {openMenu && (
          <motion.div
            className={style.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={() => setOpenMenu(false)}
          />
        )}
      </AnimatePresence>

      {/* Само меню */}
      <AnimatePresence mode="wait">
        {openMenu && (
          <motion.section
            key="mobile-menu"
            className={style.mobile_left_panel}
            initial={{ x: "-100%", opacity: 0 }}
            animate={{
              x: 0,
              opacity: 1,
              transition: {
                type: "spring",
                damping: 25,
                stiffness: 200,
                mass: 0.8,
              },
            }}
            exit={{
              x: "-100%",
              opacity: 0,
              transition: {
                duration: 0.25,
                ease: "easeIn",
              },
            }}
          >
            <div className={style.mobile_left_panel__container}>
              <div className={style.mobile_left_panel__logo}>
                <button
                  className={style.header__menu}
                  onClick={() => setOpenMenu(false)}
                  aria-label="Закрыть меню"
                />

                <Link to="/" onClick={() => setOpenMenu(false)}>
                  <img src={logo} alt="лого" />
                </Link>
              </div>

              <div className={style.mobile_left_panel__wrapper}>
                <ul>
                  <li>
                    <motion.button
                      className={`${style.left_panel__item} ${
                        isPersonalOpen ? style.left_panel__item__active : ""
                      }`}
                      onClick={togglePersonal}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={style.left_panel__item__name}>
                        <Person />
                        <p>Личное</p>
                      </div>
                      <Angle />
                    </motion.button>

                    <motion.div
                      initial={false}
                      animate={{
                        height: isPersonalOpen ? "auto" : 0,
                        opacity: isPersonalOpen ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <ul>
                        {personalItems.map((item, index) => (
                          <motion.li
                            key={index}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{
                              x: 0,
                              opacity: isPersonalOpen ? 1 : 0,
                            }}
                            transition={{
                              duration: 0.25,
                              delay: isPersonalOpen ? 0.1 + index * 0.04 : 0,
                              ease: "easeOut",
                            }}
                            className={isActive(item.path) ? style.active : ""}
                          >
                            <Link
                              to={item.path}
                              onClick={() => setOpenMenu(false)}
                            >
                              {item.icon}
                              <p>{item.text}</p>
                            </Link>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </li>

                  <li>
                    <motion.button
                      className={`${style.left_panel__item} ${
                        isBusinessOpen ? style.left_panel__item__active : ""
                      }`}
                      onClick={toggleBusiness}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={style.left_panel__item__name}>
                        <Business />
                        <p>Бизнесу</p>
                      </div>
                      <Angle />
                    </motion.button>
                    <motion.div
                      initial={false}
                      animate={{
                        height: isBusinessOpen ? "auto" : 0,
                        opacity: isBusinessOpen ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <ul>
                        {businessItems.map((item, index) => (
                          <motion.li
                            key={index}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{
                              x: 0,
                              opacity: isBusinessOpen ? 1 : 0,
                            }}
                            transition={{
                              duration: 0.25,
                              delay: isBusinessOpen ? 0.1 + index * 0.04 : 0,
                              ease: "easeOut",
                            }}
                            className={isActive(item.path) ? style.active : ""}
                          >
                            <Link
                              to={item.path}
                              onClick={() => setOpenMenu(false)}
                            >
                              {item.icon}
                              <p>{item.text}</p>
                            </Link>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </li>
                </ul>

                <button
                  className={style.mobile_left_panel__signout}
                  onClick={() => setOpenMenu(false)}
                >
                  <SignOut />
                  Выйти
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileLeftPanel;
