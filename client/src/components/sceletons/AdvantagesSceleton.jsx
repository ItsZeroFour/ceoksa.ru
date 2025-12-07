import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AdvantagesSceleton = () => (
  <div>
    <Skeleton
      height={100}
      width="50vw"
      borderRadius={20}
      animation="wave"
      baseColor="#141414"
      highlightColor="#191919"
    />
  </div>
);

export default AdvantagesSceleton;
