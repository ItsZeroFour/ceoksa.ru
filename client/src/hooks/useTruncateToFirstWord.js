import { useState, useEffect } from "react";

/**
 * Хук, который обрезает строку до первого слова, если ширина экрана ≤ 425px
 * @param {string} text — исходная строка
 * @returns {string} — обрезанная или полная строка
 */
export const useTruncateToFirstWord = (text) => {
  const [truncatedText, setTruncatedText] = useState(text);

  useEffect(() => {
    const checkWidthAndTruncate = () => {
      if (typeof window === "undefined") return;

      const isNarrow = window.innerWidth <= 425;

      if (isNarrow) {
        const firstWord = text.split(" ")[0] || "";
        setTruncatedText(firstWord);
      } else {
        setTruncatedText(text);
      }
    };

    checkWidthAndTruncate();

    window.addEventListener("resize", checkWidthAndTruncate);

    return () => {
      window.removeEventListener("resize", checkWidthAndTruncate);
    };
  }, [text]);

  return truncatedText;
};
