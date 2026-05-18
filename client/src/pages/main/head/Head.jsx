import React, { useEffect } from "react";
import style from "./head.module.scss";
// import img from "../../../assets/images/main/head.webp";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHead } from "../../../redux/slices/strapi/headSlice";
import HeadSceleton from "../../../components/sceletons/HeadSceleton";

const Head = ({ scrollToBlock }) => {
  const dispatch = useDispatch();

  const { data, status, error } = useSelector((state) => state.head);

  useEffect(() => {
    dispatch(fetchHead("shapka?populate=*"));
  }, [dispatch]);

  const renderTitle = (title) => {
    if (!title) return null;
    const words = title.trim().split(/\s+/);
    const firstWords = words.slice(0, 3).join(" ");
    const restWords = words.slice(3).join(" ");
    return (
      <>
        <span className={style.head__title__big}>{firstWords}</span>
        {restWords && <> {restWords}</>}
      </>
    );
  };

  return (
    <section className={style.head}>
      <div className="container">
        {status === "loading" || status === "failed" ? (
          <HeadSceleton />
        ) : (
          <div className={style.head__wrapper}>
            <div className={style.head__text}>
              <h1>{renderTitle(data.title)}</h1>
              <p>{data.description}</p>

              <Link to="#" onClick={() => scrollToBlock("credit")}>
                {data.button_text}
              </Link>
            </div>

            <div className={style.head__img}>
              <img
                src={`${process.env.REACT_APP_ADMIN_IMAGES}${data.image?.url}`}
                alt="main"
              />
            </div>

            <Link
              className={style.head__link__mobile}
              to="#"
              onClick={() => scrollToBlock("credit")}
            >
              {data.button_text}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Head;
