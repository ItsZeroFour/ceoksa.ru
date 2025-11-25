import React, { useState } from "react";
import style from "./leftpanel.module.scss";
import { motion } from "framer-motion";
import { ReactComponent as Person } from "../../assets/icons/left_panel/person.svg";
import { ReactComponent as List } from "../../assets/icons/left_panel/list.svg";
import { ReactComponent as Money } from "../../assets/icons/left_panel/money.svg";
import { ReactComponent as Rate } from "../../assets/icons/left_panel/rate.svg";
import { ReactComponent as Profile } from "../../assets/icons/left_panel/profile.svg";
import { ReactComponent as Business } from "../../assets/icons/left_panel/business.svg";
import { ReactComponent as Angle } from "../../assets/icons/left_panel/angle.svg";
import { Link, useLocation } from "react-router-dom";

const personalItems = [
  { icon: <List />, text: "Заявка на кредит", path: "/loan_applications" },
  { icon: <Money />, text: "Кредиты", path: "/credits" },
  { icon: <Rate />, text: "Кредитный рейтинг", path: "/rating" },
  { icon: <Profile />, text: "Профиль", path: "/profile" },
];

const businessItems = [];

const LeftPanel = () => {
  const location = useLocation();
  const [isPersonalOpen, setIsPersonalOpen] = useState(true);
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);

  const togglePersonal = () => setIsPersonalOpen(!isPersonalOpen);
  const toggleBusiness = () => setIsBusinessOpen(!isBusinessOpen);

  const isActive = (path) => location.pathname === `/account${path}`;

  console.log(location.pathname);

  return (
    <section className={style.left_panel}>
      <div className={style.left__panel__wrapper}>
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
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <ul>
                {personalItems.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: isPersonalOpen ? 1 : 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                    className={isActive(item.path) ? style.active : ""}
                  >
                    <Link to={item.path}>
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
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <ul>
                {businessItems.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: isBusinessOpen ? 1 : 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                    className={isActive(item.path) ? style.active : ""}
                  >
                    <Link to={item.path}>
                      {item.icon}
                      <p>{item.text}</p>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default LeftPanel;
