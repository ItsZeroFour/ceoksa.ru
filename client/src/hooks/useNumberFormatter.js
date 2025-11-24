export const useNumberFormatter = () => {
  const formatNumber = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  return { formatNumber };
};