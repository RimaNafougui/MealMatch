"use client";

import { motion } from "framer-motion";

const items = [
  { src: "/icons/leaf.png", left: "15%", size: 56, delay: 0 },
  { src: "/icons/apple.png", left: "45%", size: 48, delay: 6 },
  { src: "/icons/carrot.png", left: "75%", size: 64, delay: 12 },
];

export function FloatingFood() {
  return (
    <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
      {items.map((item, i) => (
        <motion.img
          key={i}
          src={item.src}
          alt=""
          className="absolute opacity-20"
          style={{ left: item.left, width: item.size }}
          initial={{ y: "110vh" }}
          animate={{
            y: "-20vh",
            rotate: [0, 8, -8, 0],
            x: [0, 20, -20, 0],
          }}
          transition={{
            duration: 26,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}