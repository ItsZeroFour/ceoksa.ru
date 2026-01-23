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
          Мы используем <Link to="/privacy-policy">файлы куки</Link>, чтобы
          показывать вам подходящий контент 
        </p>

        <button onClick={handleAccept}>Ок</button>
      </div>
    </div>
  );
};

export default Cookies;
