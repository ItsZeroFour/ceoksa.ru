import { useState } from "react";

export const useValidation = (initialValues = {}, validators = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    if (!validators[name]) return "";
    const msg = validators[name].map((rule) => rule(value)).find((v) => v);
    return msg || "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    const err = validateField(name, value);
    setErrors({ ...errors, [name]: err });
  };

  const getFieldProps = (name) => ({
    name,
    value: values[name] || "",
    onChange: handleChange,
  });

  const hasError = (name) => Boolean(errors[name]);

  return { values, errors, getFieldProps, hasError };
};
