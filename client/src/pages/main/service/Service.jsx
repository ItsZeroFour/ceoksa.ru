import React, { useEffect } from "react";
import style from "./service.module.scss";
import servicePhoneImg from "../../../assets/images/main/service_phone.webp";
import servicePhoneImgDark from "../../../assets/images/main/service_phone-dark.webp";
import serviceItemImg1 from "../../../assets/images/main/service-1.webp";
import serviceItemImg2 from "../../../assets/images/main/service-2.webp";
import serviceItemImg3 from "../../../assets/images/main/service-3.webp";
import { useTheme } from "../../../hooks/useTheme";
import { useDispatch, useSelector } from "react-redux";
import { fetchService } from "../../../redux/slices/strapi/serviceSlice";
import ServiceSceleton from "../../../components/sceletons/ServiceSceleton";

const Service = () => {
  const dispatch = useDispatch();

  const { data, status, error } = useSelector((state) => state.service);

  useEffect(() => {
    dispatch(fetchService("servich?populate=service.image"));
  }, [dispatch]);

  const isDataReady = Boolean(
    status === "succeeded" &&
      data?.service &&
      Array.isArray(data.service) &&
      data.service.length > 0 &&
      data?.title &&
      data?.description
  );

  const { theme } = useTheme();

  return (
    <section className={style.service}>
      <div className="container">
        {!isDataReady ? (
          <ServiceSceleton />
        ) : (
          <div className={style.service__wrapper}>
            <div className={style.service__main}>
              <div className={style.service__text}>
                <h2>{data.title}</h2>
                <p>{data.description}</p>

                <p>{data.description_2}</p>
              </div>

              <div className={style.service__image}>
                <img
                  src={
                    theme === "light" ? servicePhoneImg : servicePhoneImgDark
                  }
                  alt="Сервис"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {isDataReady && (
        <ul className={style.service__list}>
          {data.service.map((item, index) => (
            <li key={index} className={style.service__item}>
              <div className={style.service__item__text}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <img
                src={`${process.env.REACT_APP_ADMIN_IMAGES}${item.image.url}`}
                loading="lazy"
                alt={item.title}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Service;
