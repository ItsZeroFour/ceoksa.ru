import React, { useEffect } from "react";
import style from "./footer.module.scss";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFooter } from "../../redux/slices/strapi/footerSlice";
import DOMPurify from "dompurify";

const Footer = () => {
  const dispatch = useDispatch();

  const { data, status, error } = useSelector((state) => state.footer);

  useEffect(() => {
    dispatch(fetchFooter("futer?populate=*"));
  }, [dispatch]);

  const isDataReady = Boolean(status === "succeeded" && data?.text);

  const cleanHTML = DOMPurify.sanitize(isDataReady && data.text, {
    ALLOWED_TAGS: ["p", "a", "br", "strong", "em", "div", "span"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  return (
    <footer className={style.footer}>
      <div className="container">
        {isDataReady && (
          <div className={style.footer__wrappe}>
            <p dangerouslySetInnerHTML={{ __html: cleanHTML }} />

            <Link to="/polzovatelskoe-soglashenie">
              Пользовательское соглашение
            </Link>
            <Link to="/privacy-policy">Политика конфиденциальности</Link>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
