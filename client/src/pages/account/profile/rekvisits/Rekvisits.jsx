import React, { useState, useEffect } from "react";
import axios from "axios";
import style from "./rekvisits.module.scss";
import { ReactComponent as Card } from "../../../../assets/icons/profile/card.svg";
import { ReactComponent as Edit } from "../../../../assets/icons/account/edit.svg";
import { useScreenWidth } from "../../../../hooks/useScreenWidth";

const Rekvisits = ({ user }) => {
  const screenWidth = useScreenWidth();
  const [bankName, setBankName] = useState("Загрузка...");

  const placeholder =
    screenWidth < 780
      ? "Укажите реквизиты"
      : "Необходимо указать реквизиты для перевода";

  const handleNumbersOnly = (e) => {
    const target = e.target;
    target.value = target.value.replace(/\D/g, "");
  };

  const validateBIC = async (bic) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVERF_API}/validate/validate-bic`,
        { bic },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (data.success && data.bank) {
        return data.bank;
      }
    } catch (error) {
      if (error.response) {
        console.error("Ошибка:", error.response.data.message);
      } else if (error.request) {
        console.error("Нет ответа от сервера");
      }
    }
  };

  useEffect(() => {
    const bic = user?.requisites?.BIC;

    if (!bic) {
      setBankName("Банк не указан");
      return;
    }

    validateBIC(bic).then((bank) => {
      setBankName(bank?.name ?? "Банк не найден");
    });
  }, [user?.requisites?.bic]);

  return (
    <div className={style.rekvisits}>
      <div className={style.rekvisits__wrapper}>
        <h2>Реквизиты для перевода</h2>

        <ul>
          <li>
            <div className={style.rekvisits__item__main}>
              <div className={style.rekvisits__item__icon}>
                <Card />
              </div>

              <div className={style.rekvisits__form__item}>
                <label htmlFor="bik">{bankName}</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="bik"
                  onInput={handleNumbersOnly}
                  placeholder={placeholder}
                  readOnly={true}
                  value={user?.requisites?.account_number || "0000000000000000"}
                />
                {/* <Edit /> */}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Rekvisits;
