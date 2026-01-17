import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTheme } from "../../hooks/useTheme";

const AdvantagesSceleton = () => {
  const { theme } = useTheme();

  return (
    <div>
      <Skeleton
        height={100}
        width="50vw"
        borderRadius={20}
        animation="wave"
        baseColor={theme === "light" ? "#fdfdfd" : "#141414"}
        highlightColor={theme === "light" ? "#f3f3f3" : "#191919"}
      />
    </div>
  );
};

export default AdvantagesSceleton;
