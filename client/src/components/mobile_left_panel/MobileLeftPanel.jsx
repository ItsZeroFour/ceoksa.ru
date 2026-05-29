import React, { useState } from "react";
import style from "../left_panel/leftpanel.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import { ReactComponent as Person } from "../../assets/icons/left_panel/person.svg";
import { ReactComponent as List } from "../../assets/icons/left_panel/list.svg";
import { ReactComponent as Money } from "../../assets/icons/left_panel/money.svg";
import { ReactComponent as Rate } from "../../assets/icons/left_panel/rate.svg";
import { ReactComponent as Profile } from "../../assets/icons/left_panel/profile.svg";
import { ReactComponent as Angle } from "../../assets/icons/left_panel/angle.svg";
import { ReactComponent as SignOut } from "../../assets/icons/left_panel/signout.svg";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import logo from "../../assets/logo.svg";
import logoDark from "../../assets/logo-dark.svg";
import { useTheme } from "../../hooks/useTheme";
import axios from "../../utils/axios";
import { useMenu } from "../../App";
import { logout } from "../../redux/slices/auth/authSlice";

const personalItems = [
  { icon: <List />, text: "Заявка на кредит", path: "/loan_applications" },
  { icon: <Rate />, text: "Предложения банков", path: "/credits" },
  { icon: <Money />, text: "Кредиты", path: "/my-credits" },
  { icon: <Profile />, text: "Профиль", path: "/profile" },
];

const MobileLeftPanel = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isPersonalOpen, setIsPersonalOpen] = useState(true);
  const { openMenu, setOpenMenu } = useMenu();

  const togglePersonal = () => setIsPersonalOpen(!isPersonalOpen);
  const isActive = (path) => location.pathname === `/account${path}`;

  const { theme } = useTheme();

  const handleLogout = () => {
    // Cookie не httpOnly — удаляем её прямо из JS.
    dispatch(logout());
    setOpenMenu(false);
    document.cookie = "app_token=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    axios.post("/logout").catch(() => {});
    window.location.replace("/");
  };

  return (
    <div className={style.mobile_left_panel__main}>
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
              transition: { duration: 0.25, ease: "easeIn" },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.4, right: 0 }}
            onDragEnd={(event, info) => {
              if (info.offset.x < -50 || info.velocity.x < -300) {
                setOpenMenu(false);
              }
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
                  <img src={theme === "light" ? logo : logoDark} alt="лого" />
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
                          <li
                            key={index}
                            className={isActive(item.path) ? style.active : ""}
                          >
                            <Link
                              to={`/account${item.path}`}
                              onClick={() => setOpenMenu(false)}
                            >
                              {item.icon}
                              <p>{item.text}</p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </li>
                </ul>

                <button
                  className={style.mobile_left_panel__signout}
                  onClick={handleLogout}
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
