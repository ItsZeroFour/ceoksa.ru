import React from "react";
import style from "./progressBar.module.scss";

const ProgressBar = ({ percent = 0, color = "#4cbd20", height = "8px" }) => {
  return (
    <div
      className={style.progressBar}
      style={{
        height,
        backgroundColor: "#D7DBDE",
        borderRadius: "100px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        className={style.progressBarFill}
        style={{
          width: `${percent}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius: "100px",
          transition: "width 0.4s ease-out",
        }}
      />
    </div>
  );
};

export default ProgressBar;
