"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf } from "lucide-react";

type SplashContextType = { hideSplash: () => void };

const SplashContext = createContext<SplashContextType>({ hideSplash: () => {} });

export const useSplash = () => useContext(SplashContext);

function SplashOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-success to-success-600 flex items-center justify-center shadow-2xl shadow-success/30"
      >
        <Leaf size={40} className="text-white" strokeWidth={2.5} />
      </motion.div>

      <motion.div
        className="mt-5 flex flex-col items-center leading-none"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
      >
        <span className="text-3xl font-bold tracking-tight text-foreground">
          MealMatch
        </span>
        <span className="mt-1 text-[10px] tracking-[0.25em] font-medium uppercase text-success">
          Nutrition
        </span>
      </motion.div>

      <motion.div
        className="mt-10 flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-success/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const hideSplash = () => setVisible(false);

  // Safety net: auto-dismiss after 8s regardless
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <SplashContext.Provider value={{ hideSplash }}>
      <AnimatePresence>{visible && <SplashOverlay key="splash" />}</AnimatePresence>
      {children}
    </SplashContext.Provider>
  );
}
