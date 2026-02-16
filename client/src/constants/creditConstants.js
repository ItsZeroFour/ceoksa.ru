export const TERMS = [
  { value: 3, title: "3 месяца" },
  { value: 6, title: "6 месяцев" },
  { value: 9, title: "9 месяцев" },
  { value: 12, title: "1 год" },
  { value: 24, title: "2 года" },
  { value: 36, title: "3 года" },
  { value: 48, title: "4 года" },
  { value: 60, title: "5 лет" },
];

export const TARGETS = [
  { value: "cash", title: "Кредит наличными" },
  { value: "mortgage", title: "Ипотека" },
  { value: "car", title: "Покупка авто" },
  { value: "education", title: "Образование" },
  { value: "renovation", title: "Ремонт" },
  { value: "travel", title: "Путешествия" },
  { value: "other", title: "Другое" },
];

export const CREDIT_LIMITS = {
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 10_000_000,
  STEP: 1000,
  MIN_SALARY: 10000,
};
