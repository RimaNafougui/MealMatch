"use client";

import { motion } from "framer-motion";
import { Image } from "@heroui/image";

export function FloatingHeroImage() {
  return (
    <motion.div
      initial={{ y: 12 }}
      animate={{ y: -12 }}
      transition={{
        duration: 6,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      <Image
        isBlurred
        alt="Meal prep containers with healthy food"
        className="object-cover rounded-xl shadow-lg"
        height={400}
        width={600}
        src="/foodPuzzle.png"
      />
    </motion.div>
  );
}
