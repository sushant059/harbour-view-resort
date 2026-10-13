"use client";

import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { BackgroundVideo } from "@/components/photo";
import type { StockClip } from "@/lib/stock";

/**
 * A small framed film that opens out to fill the whole screen as you scroll, with the words
 * splitting apart around it.
 */
export function ExpandingFilm({ clip, eyebrow, left, right, caption }: { clip: StockClip; eyebrow: string; left: string; right: string; caption: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const inset = useTransform(scrollYProgress, [0, 0.6], [32, 0]);
  const insetX = useTransform(scrollYProgress, [0, 0.6], [30, 0]);
  const radius = useTransform(scrollYProgress, [0, 0.6], [32, 0]);
  const frame = useMotionTemplate`inset(${inset}% ${insetX}% ${inset}% ${insetX}% round ${radius}px)`;
  const leftX = useTransform(scrollYProgress, [0, 0.6], ["0vw", "-40vw"]);
  const rightX = useTransform(scrollYProgress, [0, 0.6], ["0vw", "40vw"]);
  const words = useTransform(scrollYProgress, [0.35, 0.6], [1, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0.6, 0.75], [0, 1]);
  const captionY = useTransform(scrollYProgress, [0.6, 0.75], [40, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);

  return (
    <section ref={ref} className="relative h-[260vh] bg-navy-deep text-white">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ clipPath: frame }}>
          <motion.div className="absolute inset-0" style={{ scale }}>
            <BackgroundVideo clip={clip} />
          </motion.div>
          <div className="absolute inset-0 bg-navy-deep/30" aria-hidden />
        </motion.div>
        <motion.p className="absolute left-0 right-0 top-[10%] text-center text-[11px] font-semibold uppercase tracking-[0.36em] text-sky" style={{ opacity: words }}>{eyebrow}</motion.p>
        <div className="pointer-events-none relative flex w-full items-center justify-center gap-[34vw] font-display text-[13vw] font-light leading-none tracking-[-0.04em] md:text-[9vw]">
          <motion.span style={{ x: leftX, opacity: words }}>{left}</motion.span>
          <motion.span style={{ x: rightX, opacity: words }} className="italic text-sky">{right}</motion.span>
        </div>
        <div className="absolute inset-x-0 bottom-[12%] flex justify-center px-4">
          <motion.p className="max-w-3xl text-center font-display text-3xl font-light leading-tight md:text-5xl" style={{ opacity: captionOpacity, y: captionY }}>
            {caption}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
