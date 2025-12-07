import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CreditSceleton = () => (
  <div>
    <Skeleton height={400} width="100%" borderRadius={20} animation="wave" baseColor="#141414" highlightColor="#191919" />
  </div>
);

export default CreditSceleton;
