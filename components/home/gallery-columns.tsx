"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { Photo } from "@/components/photo";
import type { StockImage } from "@/lib/stock";

function Column({ images, y, className }: { images: StockImage[]; y: MotionValue<string>; className?: string }) {
  return (
    <motion.div style={{ y }} className={`flex flex-col gap-4 md:gap-6 ${className ?? ""}`}>
      {images.map((image, index) => (
        <div key={`${image.id}-${index}`} className={`group relative overflow-hidden rounded-[20px] ${index % 2 ? "aspect-[4/5]" : "aspect-[3/4]"}`}>
          <Photo stock={[image]} alt={image.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="transition duration-[1.4s] group-hover:scale-110" />
          <span className="absolute inset-x-3 bottom-3 translate-y-3 rounded-full bg-navy-deep/60 px-3 py-1.5 text-xs text-white opacity-0 backdrop-blur transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">{image.alt}</span>
        </div>
      ))}
    </motion.div>
  );
}

/** Four columns of photos sliding past each other at different speeds. */
export function GalleryColumns({ images }: { images: StockImage[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const a = useTransform(scrollYProgress, [0, 1], ["8%", "-22%"]);
  const b = useTransform(scrollYProgress, [0, 1], ["-14%", "12%"]);
  const c = useTransform(scrollYProgress, [0, 1], ["16%", "-30%"]);
  const d = useTransform(scrollYProgress, [0, 1], ["-6%", "8%"]);
  const cols = [0, 1, 2, 3].map((n) => images.filter((_, i) => i % 4 === n));
  return (
    <section ref={ref} className="relative overflow-hidden bg-navy-deep py-24 text-white md:py-32">
      <div className="container-x relative z-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-sky"><span className="h-px w-10 bg-sky" /> Gallery</p>
          <h2 className="mt-6 font-display text-5xl font-medium leading-[0.95] tracking-[-0.03em] md:text-7xl">Moments, <em className="font-light text-sky">framed</em></h2>
        </div>
        <Link href="/results" data-cursor="Open" className="group inline-flex items-center gap-3 rounded-full border border-white/25 px-6 py-3 font-semibold hover:border-sky hover:text-sky">Full gallery <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" aria-hidden /></Link>
      </div>
      <div className="mx-auto mt-16 grid h-[110vh] max-w-[1600px] grid-cols-2 gap-4 overflow-hidden px-4 md:grid-cols-4 md:gap-6 md:px-6">
        <Column images={cols[0]} y={a} />
        <Column images={cols[1]} y={b} className="pt-16" />
        <Column images={cols[2]} y={c} className="hidden md:flex" />
        <Column images={cols[3]} y={d} className="hidden pt-24 md:flex" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-navy-deep to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-48 h-32 bg-gradient-to-b from-navy-deep to-transparent" aria-hidden />
    </section>
  );
}
