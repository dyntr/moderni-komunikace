import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  y?: number;
  rotate?: number;
}

const FloatingElement = ({ children, className = "", duration = 6, delay = 0, y = 20, rotate = 5 }: FloatingElementProps) => (
  <motion.div
    className={className}
    animate={{
      y: [-y / 2, y / 2, -y / 2],
      rotate: [-rotate, rotate, -rotate],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
);

export default FloatingElement;
