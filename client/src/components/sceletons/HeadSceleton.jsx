import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTheme } from "../../hooks/useTheme";

const HeadSceleton = () => {
  const { theme } = useTheme();

  return (
    <div>
      <Skeleton
        height={600}
        width="100%"
        borderRadius={20}
        animation="wave"
        baseColor={theme === "light" ? "#fdfdfd" : "#141414"}
        highlightColor={theme === "light" ? "#f3f3f3" : "#191919"}
      />
    </div>
  );
};

export default HeadSceleton;
