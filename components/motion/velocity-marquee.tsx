"use client";

import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity, wrap } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A giant line of type that drifts on its own and speeds up (or reverses) with the scroll,
 * like a ticker reacting to the page.
 */
export function VelocityMarquee({ items, baseVelocity = -2.5, className, outline = false }: { items: string[]; baseVelocity?: number; className?: string; outline?: boolean }) {
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(base, (value) => `${wrap(-25, -50, value)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    let move = direction.current * baseVelocity * (delta / 1000);
    if (factor.get() < 0) direction.current = -1;
    else if (factor.get() > 0) direction.current = 1;
    move += direction.current * move * factor.get();
    base.set(base.get() + move);
  });

  const line = (
    <span className="flex shrink-0 items-center">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="flex items-center">
          <span className={cn(outline && "text-outline")}>{item}</span>
          <svg viewBox="0 0 24 24" className="mx-[0.35em] h-[0.42em] w-[0.42em] shrink-0 text-sky" aria-hidden><path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" /></svg>
        </span>
      ))}
    </span>
  );

  return (
    <div className={cn("flex overflow-hidden whitespace-nowrap", className)} aria-hidden>
      <motion.div className="flex" style={{ x }}>
        {line}
        {line}
        {line}
        {line}
      </motion.div>
    </div>
  );
}
