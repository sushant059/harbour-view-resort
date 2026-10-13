"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/**
 * A soft gold cursor for mouse users. It grows over links and buttons, and shows a word
 * ("View", "Book", "Play"…) over anything marked with data-cursor="…".
 */
export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 });
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");
  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    function onMove(event: PointerEvent) {
      x.set(event.clientX);
      y.set(event.clientY);
      setHidden(false);
      const target = event.target as HTMLElement | null;
      const tagged = target?.closest<HTMLElement>("[data-cursor]");
      setLabel(tagged?.dataset.cursor ?? "");
      setHovering(Boolean(target?.closest("a, button, summary, label, select, input, textarea, [role='tab']")));
      setDark(Boolean(target?.closest("[data-cursor-dark]")));
    }
    const onLeave = () => setHidden(true);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;
  const size = label ? 92 : hovering ? 54 : 34;
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[200] grid place-items-center rounded-full"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: size,
          height: size,
          opacity: hidden ? 0 : 1,
          backgroundColor: label ? "rgba(217,183,126,0.95)" : "rgba(217,183,126,0)",
          borderColor: dark ? "rgba(19,38,47,0.55)" : "rgba(217,183,126,0.75)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        <span className="absolute inset-0 rounded-full border" style={{ borderColor: "inherit" }} />
        {label && <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-deep">{label}</span>}
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[201] h-1.5 w-1.5 rounded-full bg-sky"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: hidden || label ? 0 : 1, scale: hovering ? 0 : 1 }}
      />
    </>
  );
}
