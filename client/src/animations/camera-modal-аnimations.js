const modalSpring = {
  type: "spring",
  damping: 25,
  stiffness: 300,
};

export const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalVariants = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
};

export const modalTransition = modalSpring;
