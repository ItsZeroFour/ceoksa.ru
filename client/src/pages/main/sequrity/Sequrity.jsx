import React, { useEffect } from "react";
import style from "./sequrity.module.scss";
import { ReactComponent as Checkbox } from "../../../assets/icons/checkbox.svg";
import { ReactComponent as Message } from "../../../assets/icons/message.svg";
import { ReactComponent as Phone } from "../../../assets/icons/phone.svg";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSequrity } from "../../../redux/slices/strapi/sequritySlice";
import SequritySceleton from "../../../components/sceletons/SequritySelector";

const Sequrity = () => {
  const dispatch = useDispatch();

  const { data, status, error } = useSelector((state) => state.sequrity);

  useEffect(() => {
    dispatch(fetchSequrity("bezopasnost?populate=*"));
  }, [dispatch]);

  const isDataReady = Boolean(status === "succeeded" && data?.title);

  console.log(data);

  const formatRussianPhone = (phone) => {
    const digits = phone.replace(/\D/g, "");

    let normalized;
    if (digits.startsWith("8")) {
      normalized = "7" + digits.slice(1);
    } else if (digits.startsWith("7")) {
      normalized = digits;
    } else if (digits.length === 10) {
      normalized = "7" + digits;
    } else {
      return phone;
    }

    if (normalized.length !== 11) return phone;

    return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(
      4,
      7
    )}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`;
  };

  const getTelLink = (phone) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("8")) {
      return "+7" + digits.slice(1);
    } else if (digits.startsWith("7")) {
      return "+" + digits;
    } else if (digits.length === 10) {
      return "+7" + digits;
    }
    return "+" + digits;
  };

  return (
    <section className={style.sequrity}>
      <div className="container">
        {!isDataReady ? (
          <SequritySceleton />
        ) : (
          <div className={style.sequrity__container}>
            <div className={style.sequrity__wrapper}>
              <h2>{data.title}</h2>

              <div className={style.sequrity__list}>
                <ul>
                  <li>
                    <h3>{data.list_item_1_title}</h3>

                    <ol>
                      <li>
                        <div>
                          <Checkbox />
                        </div>
                        {data.list_item_1_text_1}
                      </li>
                      <li>
                        <div>
                          <Checkbox />
                        </div>
                        {data.list_item_1_text_2}
                      </li>
                      <li>
                        <div>
                          <Checkbox />
                        </div>
                        {data.list_item_1_text_3}
                      </li>
                    </ol>
                  </li>

                  <li>
                    <h3>{data.list_item_2_title}</h3>

                    <ol>
                      <li>
                        <div>
                          <Message />
                        </div>
                        {data.list_item_2_text_1}
                      </li>
                      <li>
                        <div>
                          <Phone />
                        </div>
                        {data.list_item_2_text_2}
                      </li>
                      <li>
                        <div>
                          <Checkbox />
                        </div>
                        {data.list_item_2_text_3}
                      </li>
                    </ol>
                  </li>

                  <li>
                    <h3>{data.list_item_3_title}</h3>

                    <p>{data.list_item_3_text}</p>

                    <div className={style.sequrity__item__contacts}>
                      <p>{data.list_item_3_number_work}</p>
                      <Link
                        to={`tel:${getTelLink(data.list_item_3_number_phone)}`}
                      >
                        {formatRussianPhone(data.list_item_3_number_phone)}
                      </Link>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Sequrity;
