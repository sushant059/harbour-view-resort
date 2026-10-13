"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * The opening curtain, shown once per visit: the crest draws itself, a counter runs to 100,
 * then the curtain lifts off the hero. It is in the server HTML (so there's no flash of the page
 * first) and the head script hides it straight away for repeat visits and reduced motion.
 */
export function Preloader() {
  const [show, setShow] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("intro-seen")) {
      setShow(false);
      return;
    }
    try {
      sessionStorage.setItem("hvr-intro", "1");
    } catch {}
    const started = performance.now();
    const total = 1700;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / total);
      setCount(Math.round(100 * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setTimeout(() => setShow(false), 180);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!show) document.documentElement.classList.add("intro-done");
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          className="preloader fixed inset-0 z-[300] flex flex-col items-center justify-center bg-navy-deep text-white"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <svg viewBox="0 0 120 120" className="h-24 w-24 text-sky" fill="none" stroke="currentColor" strokeWidth="1.4">
            <motion.circle cx="60" cy="60" r="54" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.3, ease: "easeInOut" }} />
            <motion.path d="M22 74c10-6 20-6 30 0s20 6 30 0 16-5 22-2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.35, ease: "easeInOut" }} />
            <motion.path d="M26 86c10-6 20-6 30 0s20 6 30 0 12-4 16-2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }} />
            <motion.path d="M40 62a20 20 0 0 1 40 0" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 0.2, ease: "easeInOut" }} />
            <motion.path d="M60 30v8M38 40l5 5M82 40l-5 5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.9 }} />
          </svg>
          <motion.p className="mt-8 overflow-hidden font-display text-3xl italic tracking-wide text-white/90" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
            Harbour View
          </motion.p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.5em] text-sky/80">Resort · Darwin</p>
          <div className="absolute bottom-10 left-6 right-6 flex items-end justify-between sm:left-10 sm:right-10">
            <span className="text-xs uppercase tracking-[0.3em] text-white/45">Arriving</span>
            <span className="font-display text-6xl tabular-nums text-white/90 sm:text-8xl">{count}</span>
          </div>
          <div className="absolute bottom-0 left-0 h-px bg-sky/70" style={{ width: `${count}%` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
