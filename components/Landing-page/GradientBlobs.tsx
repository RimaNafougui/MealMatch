"use client";

import { motion } from "framer-motion";

export function GradientBlobs() {
  return (
    <div className="absolute inset-0 -z-25 overflow-hidden">
      <motion.div
        className="absolute w-[520px] h-[520px] bg-primary/30 rounded-full blur-3xl"
        style={{ top: "-15%", left: "-15%" }}
        animate={{ scale: [1, 1.2, 1], x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute w-[420px] h-[420px] bg-secondary/30 rounded-full blur-3xl"
        style={{ bottom: "-15%", right: "-15%" }}
        animate={{ scale: [1, 1.15, 1], x: [0, -30, 0], y: [0, -25, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
