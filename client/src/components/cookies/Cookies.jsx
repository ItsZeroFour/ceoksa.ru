import React, { useEffect, useState } from "react";
import style from "./cookies.module.scss";
import { Link } from "react-router-dom";

const Cookies = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookiesAccepted");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={style.cookies}>
      <div className={style.cookies__wrapper}>
        <p>
          Оставаясь с нами, вы соглашаетесь на использование{" "}
          <Link to="/privacy-policy">файлов куки</Link>.
        </p>

        <button onClick={handleAccept}>Ок</button>
      </div>
    </div>
  );
};

export default Cookies;
