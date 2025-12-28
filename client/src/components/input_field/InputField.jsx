import React, { forwardRef } from "react";
import style from "./InputField.module.scss";
import { ReactComponent as Edit } from "../../assets/icons/account/edit.svg";

const InputField = forwardRef(
  (
    {
      icon: IconComponent,
      label,
      placeholder,
      id,
      type = "text",
      fieldProps,
      hasError,
      errorText,
      readOnly = false,
      children,
      onChange,
      fontSize,
    },
    ref
  ) => {
    return (
      <div className={style.inputfield__wrapper}>
        {IconComponent && (
          <div className={style.inputfield__icon}>
            <IconComponent />
          </div>
        )}

        <div
          className={`${style.inputfield__content} ${
            hasError
              ? style.inputfield__content_error
              : style.inputfield__content
          }`}
        >
          {label && <label htmlFor={id}>{label}</label>}
          <div className={style.inputwith__action}>
            <input
              id={id}
              type={type}
              placeholder={placeholder}
              onChange={onChange}
              readOnly={readOnly}
              {...fieldProps}
              ref={ref}
              style={fontSize ? { fontSize: fontSize } : { fontSize: 16 }}
            />
            {children}

            <Edit />
          </div>
          {hasError && (
            <span className={style.input_error_text}>{errorText}</span>
          )}
        </div>
      </div>
    );
  }
);

export default InputField;
