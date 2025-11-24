import { useState } from "react";

export const useDropdown = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (type) => {
    setOpenDropdown((prev) => (prev === type ? null : type));
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  return {
    openDropdown,
    toggleDropdown,
    closeDropdown,
    setOpenDropdown,
  };
};
