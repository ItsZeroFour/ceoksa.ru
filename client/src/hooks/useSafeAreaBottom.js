import { useState, useEffect } from "react";

export const useSafeAreaBottom = () => {
  const [safeAreaBottom, setSafeAreaBottom] = useState(0);

  useEffect(() => {
    const calculate = () => {
      if (window.visualViewport) {
        const overflow = window.innerHeight - window.visualViewport.height;
        setSafeAreaBottom(Math.max(16, overflow));
        return;
      }

      if (/iPhone|iPod/.test(navigator.userAgent)) {
        const isLandscape = window.innerWidth > window.innerHeight;
        setSafeAreaBottom(isLandscape ? 0 : 34);
        return;
      }

      setSafeAreaBottom(16);
    };

    calculate();
    window.addEventListener("resize", calculate);
    window.addEventListener("orientationchange", calculate);

    return () => {
      window.removeEventListener("resize", calculate);
      window.removeEventListener("orientationchange", calculate);
    };
  }, []);

  return safeAreaBottom;
};
