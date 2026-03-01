import { useState, useRef } from "react";

export const useValidation = (initialValues = {}, validators = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const validatorsRef = useRef(validators);

  const validateField = (name, value) => {
    if (!validatorsRef.current[name]) return "";
    const msg = validatorsRef.current[name]
      .map((rule) => rule(value))
      .find((v) => v);
    return msg || "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const getFieldProps = (name) => ({
    name,
    value: values[name] || "",
    onChange: handleChange,
  });

  const setFieldValue = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const hasError = (name) => Boolean(errors[name]);

  return { values, errors, getFieldProps, hasError, setFieldValue };
};
