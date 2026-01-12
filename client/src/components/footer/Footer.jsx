import React, { useEffect } from "react";
import style from "./footer.module.scss";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFooter } from "../../redux/slices/strapi/footerSlice";

const Footer = () => {
  const dispatch = useDispatch();

  const { data, status, error } = useSelector((state) => state.footer);

  useEffect(() => {
    dispatch(fetchFooter("futer?populate=*"));
  }, [dispatch]);

  const isDataReady = Boolean(status === "succeeded" && data?.text);

  return (
    <footer className={style.footer}>
      <div className="container">
        {isDataReady && (
          <div className={style.footer__wrappe}>
            <p>{data.text}</p>

            <Link to="/">Пользовательское соглашение</Link>
            <Link to="/policy">Политика конфиденциальности</Link>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
