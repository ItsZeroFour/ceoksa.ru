import { useState, useEffect } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const byUserAgent =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent
      );
    const byTouchPoints = navigator.maxTouchPoints > 0;
    const byPointer = window.matchMedia("(pointer: coarse)").matches;

    setIsMobile(byUserAgent || (byTouchPoints && byPointer));
  }, []);

  return isMobile;
};

export default useIsMobile;
