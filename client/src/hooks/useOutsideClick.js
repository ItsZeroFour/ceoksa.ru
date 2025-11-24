import { useEffect } from "react";

export const useOutsideClick = (refs, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      const isOutside = refs.every((ref) => {
        return ref.current && !ref.current.contains(event.target);
      });

      if (isOutside) {
        callback();
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [refs, callback]);
};
