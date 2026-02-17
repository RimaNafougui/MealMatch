"use client";

import { motion } from "framer-motion";

export function ParallaxLayer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      animate={{
        y: [-8, 8, -8],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
