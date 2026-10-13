"use client";

import { motion } from "motion/react";

/** "Harbour View" across the full width of the footer, each letter rising out of the floor. */
export function FooterWordmark() {
  const letters = [..."Harbour View"];
  return (
    <motion.p className="flex select-none justify-center overflow-hidden px-2 font-display text-[18.5vw] font-light leading-[0.8] tracking-[-0.05em] text-white/[0.08]" initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -5% 0px" }} aria-hidden>
      {letters.map((letter, index) => (
        <motion.span key={index} className="inline-block whitespace-pre" variants={{ hidden: { y: "100%" }, show: { y: "0%", transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 } } }}>
          {letter}
        </motion.span>
      ))}
    </motion.p>
  );
}
