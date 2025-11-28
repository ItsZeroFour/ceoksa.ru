export const filterVariants = {
  open: { opacity: 1, y: 0, height: "auto" },
  closed: { opacity: 0, y: -10, height: 0 },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 15, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};
