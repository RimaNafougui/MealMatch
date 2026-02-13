"use client";

import { motion, useMotionValue } from "framer-motion";
import { useEffect } from "react";

export function ParallaxLayer({
  children,
  strength = 25,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      x.set((e.clientX - cx) / strength);
      y.set((e.clientY - cy) / strength);
    };

    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return <motion.div style={{ x, y }}>{children}</motion.div>;
}
