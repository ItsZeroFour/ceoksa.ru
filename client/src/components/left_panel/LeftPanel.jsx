import React, { useState } from "react";
import style from "./leftpanel.module.scss";
import { motion } from "framer-motion";
import { ReactComponent as Person } from "../../assets/icons/left_panel/person.svg";
import { ReactComponent as List } from "../../assets/icons/left_panel/list.svg";
import { ReactComponent as Money } from "../../assets/icons/left_panel/money.svg";
import { ReactComponent as Rate } from "../../assets/icons/left_panel/rate.svg";
import { ReactComponent as Profile } from "../../assets/icons/left_panel/profile.svg";
import { ReactComponent as Angle } from "../../assets/icons/left_panel/angle.svg";
import { ReactComponent as SignOut } from "../../assets/icons/left_panel/signout.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "../../utils/axios";
import { logout } from "../../redux/slices/auth/authSlice";

const personalItems = [
  { icon: <List />, text: "Заявка на кредит", path: "/loan_applications" },
  { icon: <Rate />, text: "Предложения банков", path: "/credits" },
  { icon: <Money />, text: "Кредиты", path: "/my-credits" },
  { icon: <Profile />, text: "Профиль", path: "/profile" },
];

const LeftPanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isPersonalOpen, setIsPersonalOpen] = useState(true);

  const togglePersonal = () => setIsPersonalOpen(!isPersonalOpen);
  const isActive = (path) => location.pathname === `/account${path}`;

  const handleLogout = () => {
    // Оптимистичный выход: сразу чистим redux и уходим на главную,
    // а серверный POST /logout (он только сбрасывает cookie) шлём в фоне.
    // Раньше await + window.location.assign давали лаг ~сетевая задержка + reload.
    dispatch(logout());
    navigate("/", { replace: true });
    axios.post("/logout").catch((err) => {
      console.warn("Logout request failed:", err?.message);
    });
  };

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
                    <Link to={`/account${item.path}`}>
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
          type="button"
          className={style.left_panel__signout}
          onClick={handleLogout}
        >
          <SignOut />
          <p>Выйти</p>
        </button>
      </div>
    </section>
  );
};

export default LeftPanel;
