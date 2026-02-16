export const formatCurrency = (value) => {
  if (!value) return "";
  return `${Number(value).toLocaleString("ru-RU")} ₽`;
};

export const parseNumericInput = (value) => {
  return value.replace(/\D/g, "");
};

export const clamp = (value, min, max) => {
  return Math.min(max, Math.max(min, value));
};
