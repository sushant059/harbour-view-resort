"use client";

import { motion } from "motion/react";

/** Every page arrives behind a curtain that lifts away, with a thin gold line racing across. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        aria-hidden
        className="js-only pointer-events-none fixed inset-0 z-[95] origin-top bg-navy-deep"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
      >
        <motion.span className="absolute bottom-0 left-0 h-px bg-sky" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 0.5, ease: "easeOut" }} />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
        {children}
      </motion.div>
    </>
  );
}
