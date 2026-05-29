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
import { Link, useLocation } from "react-router-dom";
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
  const dispatch = useDispatch();
  const [isPersonalOpen, setIsPersonalOpen] = useState(true);

  const togglePersonal = () => setIsPersonalOpen(!isPersonalOpen);
  const isActive = (path) => location.pathname === `/account${path}`;

  const handleLogout = async () => {
    // Cookie app_token — httpOnly: JS не может её удалить, может только
    // сервер через Set-Cookie в ответе на /logout. Поэтому await обязателен.
    //
    // После сетевого запроса делаем ХАРДОВЫЙ reload (replace) — он гарантирует:
    //   1. чистый mount App → свежий fetchMe против уже очищенной cookie,
    //   2. удаление любого in-memory кэша Redux/axios,
    //   3. невозможность back-кнопкой вернуться на /account/* со старым стейтом.
    // Мгновенный UX обеспечивает оптимистичный dispatch(logout()) ДО сети.
    dispatch(logout());
    try {
      await axios.post("/logout");
    } catch (err) {
      console.warn("Logout request failed:", err?.message);
    }
    window.location.replace("/");
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
