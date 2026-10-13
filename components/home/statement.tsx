"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { Photo } from "@/components/photo";
import { CountUp } from "@/components/motion/primitives";
import type { StockImage } from "@/lib/stock";

type Piece = { word: string } | { image: StockImage[]; alt: string };

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const color = useTransform(progress, range, ["#9aa3a8", "#F4EFE6"]);
  return <motion.span style={{ opacity, color }} className="inline">{children} </motion.span>;
}

function InlineImage({ image, alt, progress, range }: { image: StockImage[]; alt: string; progress: MotionValue<number>; range: [number, number] }) {
  const width = useTransform(progress, range, ["0em", "2.2em"]);
  const rotate = useTransform(progress, range, [-12, 0]);
  return (
    <motion.span style={{ width, rotate }} className="relative mx-[0.12em] inline-block h-[0.82em] overflow-hidden rounded-full align-[-0.08em]">
      <Photo stock={image} alt={alt} fill sizes="160px" />
    </motion.span>
  );
}

/** A manifesto that lights up word by word as you scroll, with little photos opening inside the line. */
export function Statement({ pieces, stats }: { pieces: Piece[]; stats: [string, string][] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const step = 1 / pieces.length;
  return (
    <section className="relative bg-navy-deep py-28 text-[#F4EFE6] md:py-40">
      <div className="container-x">
        <p className="mb-10 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-sky"><span className="h-px w-10 bg-sky" /> Welcome to Harbour View</p>
        <div ref={ref} className="max-w-6xl font-display text-[34px] font-normal leading-[1.18] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-[76px]">
          {pieces.map((piece, index) => {
            const range: [number, number] = [index * step, Math.min(1, index * step + step * 3)];
            return "word" in piece ? (
              <Word key={index} progress={scrollYProgress} range={range}>{piece.word}</Word>
            ) : (
              <InlineImage key={index} image={piece.image} alt={piece.alt} progress={scrollYProgress} range={range} />
            );
          })}
        </div>
        <dl className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-white/10 bg-white/10 md:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={label} className="bg-navy-deep p-6 md:p-8">
              <dd className="font-display text-5xl font-light text-sky md:text-6xl"><CountUp value={value} /></dd>
              <dt className="mt-3 text-xs uppercase tracking-[0.24em] text-white/55">{label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
