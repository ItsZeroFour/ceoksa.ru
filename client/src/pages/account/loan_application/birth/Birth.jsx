import React, { useRef, useState } from "react";
import style from "./birth.module.scss";
import { ReactComponent as Bag } from "../../../../assets/icons/account/bag.svg";
import { ReactComponent as Town } from "../../../../assets/icons/account/town.svg";
import InputField from "../../../../components/input_field/InputField";
import { useIMask } from "../../../../hooks/useIMask";
import IMask from "imask";

const Birth = () => {


  return (
    <section className={style.birth}>
      <div className={style.birth__wrapper}>
        <h2>Дата и место рождения</h2>
      </div>
    </section>
  );
};

export default Birth;
