import React, { useState, useEffect } from "react";
import style from "./requisites.module.scss";
import Checkbox from "../../../../components/checkbox/Checkbox";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUser,
  clearError,
} from "../../../../redux/slices/user/updateUserSlice";
import axios from "axios";

const Requisites = ({ setShowRequisites, showRequisites }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.updateUser);

  const [isChecked, setIsChecked] = useState(false);
  const [bicError, setBicError] = useState("");
  const [isValidatingBic, setIsValidatingBic] = useState(false);
  const [formData, setFormData] = useState({
    account_number: "",
    recipient: "",
    BIC: "",
    bank_name: "",
    corporate_account: "",
    bank_INN: "",
    bank_KPP: "",
    have_an_account: false,
  });

  useEffect(() => {
    if (user.status === "succeeded" && user.user.data?.requisites) {
      const requisitesData = {
        account_number: user.user.data.requisites.account_number || "",
        recipient: user.user.data.requisites.recipient || "",
        BIC: user.user.data.requisites.BIC || "",
        bank_name: user.user.data.requisites.bank_name || "",
        corporate_account: user.user.data.requisites.corporate_account || "",
        bank_INN: user.user.data.requisites.bank_INN || "",
        bank_KPP: user.user.data.requisites.bank_KPP || "",
        have_an_account: user.user.data.requisites.have_an_account || false,
      };

      setFormData(requisitesData);
      setIsChecked(requisitesData.have_an_account);
    }
  }, [user]);

  const handleCheckboxChange = (e) => {
    e.stopPropagation();

    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);

    setFormData({
      ...formData,
      have_an_account: newCheckedState,
    });
  };

  const fetchBankByBic = async (bic) => {
    setIsValidatingBic(true);
    setBicError("");

    const bankData = await validateBIC(bic);

    if (bankData) {
      setFormData((prev) => ({
        ...prev,
        bank_name: bankData.name || "",
        corporate_account: bankData.correspondent_account || "",
        bank_INN: bankData.inn || "",
        bank_KPP: bankData.kpp || "",
      }));
    } else {
      setBicError("Банк не найден. Проверьте БИК.");
      setFormData((prev) => ({
        ...prev,
        bank_name: "",
        corporate_account: "",
        bank_INN: "",
        bank_KPP: "",
      }));
    }

    setIsValidatingBic(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "BIC") {
      setBicError("");

      if (/^\d{9}$/.test(value)) {
        fetchBankByBic(value);
      } else {
        setFormData((prev) => ({
          ...prev,
          BIC: value,
          bank_name: "",
          corporate_account: "",
          bank_INN: "",
          bank_KPP: "",
        }));
      }
    }
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
        },
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

  const handleBicBlur = async () => {
    if (!formData.BIC || !/^\d{9}$/.test(formData.BIC)) return;
    if (formData.bank_name) return;
    await fetchBankByBic(formData.BIC);
  };

  const handleSave = async () => {
    if (!formData.BIC) {
      alert("Пожалуйста, укажите БИК банка");
      return;
    }

    const bankData = await validateBIC(formData.BIC);

    if (!bankData) {
      alert("Невозможно сохранить реквизиты: банк не найден. Проверьте БИК.");
      return;
    }

    try {
      dispatch(clearError());
      await dispatch(
        updateUser({
          requisites: formData,
        }),
      ).unwrap();

      setShowRequisites(false);
      window.location.reload();
    } catch (error) {
      console.error("Ошибка сохранения реквизитов:", error);
      alert("Ошибка при сохранении реквизитов");
    }
  };

  const handleOverlayClick = () => {
    setShowRequisites(false);
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <section className={style.requisites} onClick={handleOverlayClick}>
      <div className={style.requisites__wrapper} onClick={handleContentClick}>
        <h2>Реквизиты для перевода</h2>
        <p>
          Укажите данные счёта, на который нужно перечислить денежные средства.
          Пожалуйста, проверьте реквизиты перед подтверждением.
        </p>

        <div className={style.requisites__check} onClick={handleCheckboxChange}>
          <Checkbox setIsChecked={setIsChecked} isChecked={isChecked} />
          <p>Есть счет в одобренном Банке</p>
        </div>

        <form>
          <div className={style.requisites__form__block}>
            <label htmlFor="account_number">Номер счета </label>
            <input
              type="text"
              id="account_number"
              name="account_number"
              placeholder="Укажите ваш номер счета"
              value={formData.account_number}
              onChange={handleChange}
            />
          </div>

          <div className={style.requisites__form__block}>
            <label htmlFor="recipient">Получатель</label>
            <input
              type="text"
              id="recipient"
              name="recipient"
              placeholder="Имя Фамилия Отчество (при наличии)"
              value={user.user.data.fullName || formData.recipient}
              onChange={handleChange}
            />
          </div>

          <div className={style.requisites__form__block}>
            <label htmlFor="BIC">БИК банка *</label>
            <input
              type="text"
              id="BIC"
              name="BIC"
              placeholder="Укажите БИК вашего банка (9 цифр)"
              value={formData.BIC}
              onChange={handleChange}
              onBlur={handleBicBlur}
              maxLength={9}
              style={bicError ? { borderColor: "red" } : {}}
            />
            {isValidatingBic && (
              <span style={{ color: "#666", fontSize: "12px" }}>
                Проверка БИК...
              </span>
            )}
            {bicError && (
              <span style={{ color: "red", fontSize: "12px" }}>{bicError}</span>
            )}
          </div>

          <div className={style.requisites__form__block}>
            <label htmlFor="bank_name">Наименования Банка</label>
            <input
              type="text"
              id="bank_name"
              name="bank_name"
              placeholder="Наименование Банка"
              value={formData.bank_name}
              onChange={handleChange}
              disabled
            />
          </div>

          <div className={style.requisites__form__block}>
            <label htmlFor="corporate_account">Кор. счёт</label>
            <input
              type="text"
              id="corporate_account"
              name="corporate_account"
              placeholder="Корреспондентский счёт"
              value={formData.corporate_account}
              onChange={handleChange}
              disabled
            />
          </div>

          <div className={style.requisites__form__block}>
            <label htmlFor="bank_INN">ИНН Банка</label>
            <input
              type="text"
              id="bank_INN"
              name="bank_INN"
              placeholder="ИНН Банка"
              value={formData.bank_INN}
              onChange={handleChange}
              disabled
            />
          </div>

          <div className={style.requisites__form__block}>
            <label htmlFor="bank_KPP">КПП Банка</label>
            <input
              type="text"
              id="bank_KPP"
              name="bank_KPP"
              placeholder="КПП Банка"
              value={formData.bank_KPP}
              onChange={handleChange}
              disabled
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading || isValidatingBic || !!bicError}
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Requisites;
