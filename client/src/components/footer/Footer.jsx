import React from "react";
import style from "./footer.module.scss";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className={style.footer}>
      <div className="container">
        <div className={style.footer__wrappe}>
          <p>
            Мы использует файлы «cookie», с целью персонализации сервисов
            и повышения удобства пользования веб-сайтом. «Cookie» представляют
            собой небольшие файлы, содержащие информацию о предыдущих посещениях
            веб-сайта. Если вы не хотите использовать файлы «cookie», измените
            настройки браузера.
          </p>

          <Link to="/">Пользовательское соглашение</Link>
          <Link to="/">Политика конфиденциальности</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
