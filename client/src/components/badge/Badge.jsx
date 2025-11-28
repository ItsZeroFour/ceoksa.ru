import React from "react";
import { useTruncateToFirstWord } from "../../hooks/useTruncateToFirstWord";
import style from "../../pages/account/credits/active/active.module.scss";

export const Badge = ({ text, style: badgeStyle }) => {
  const displayText = useTruncateToFirstWord(text);
  return (
    <div className={style.active__item__badge} style={badgeStyle}>
      <p>{displayText}</p>
    </div>
  );
};
