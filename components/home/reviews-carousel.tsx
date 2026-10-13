"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import type { Review } from "@/lib/types";

/** One big quote at a time, gliding to the next every few seconds (pauses while hovered). */
export function ReviewsCarousel({ reviews, googleHref }: { reviews: Review[]; googleHref: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = reviews.length;
  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setTimeout(() => setIndex((value) => (value + 1) % count), 6500);
    return () => clearTimeout(timer);
  }, [index, paused, count]);
  if (!count) return null;
  const review = reviews[index];
  return (
    <section className="relative overflow-hidden bg-navy-deep py-24 text-white md:py-36" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <span className="pointer-events-none absolute -left-6 top-6 select-none font-display text-[260px] leading-none text-white/[0.04] md:text-[420px]" aria-hidden>“</span>
      <div className="container-x relative">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-sky"><span className="h-px w-10 bg-sky" /> Guest voices</p>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Previous review" onClick={() => setIndex((value) => (value - 1 + count) % count)} className="grid h-12 w-12 place-items-center rounded-full border border-white/25 transition hover:border-sky hover:bg-sky hover:text-navy-deep"><ArrowLeft className="h-5 w-5" aria-hidden /></button>
            <button type="button" aria-label="Next review" onClick={() => setIndex((value) => (value + 1) % count)} className="grid h-12 w-12 place-items-center rounded-full border border-white/25 transition hover:border-sky hover:bg-sky hover:text-navy-deep"><ArrowRight className="h-5 w-5" aria-hidden /></button>
          </div>
        </div>
        <div className="relative mt-12 min-h-[340px] md:min-h-[300px]" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.figure key={review.id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              <div className="flex gap-1 text-sky" role="img" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, i) => <Star key={i} className={i < review.rating ? "h-5 w-5 fill-current" : "h-5 w-5"} aria-hidden />)}
              </div>
              {review.source === "sample" && <p className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Sample — replace with real reviews</p>}
              <blockquote className="mt-6 max-w-5xl font-display text-3xl font-light leading-[1.2] md:text-5xl">“{review.text}”</blockquote>
              <figcaption className="mt-8 flex items-center gap-4 text-sm uppercase tracking-[0.24em] text-white/60">
                <span className="h-px w-10 bg-white/40" /> {review.name}{review.service ? ` · ${review.service}` : ""}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-8">
          <div className="flex gap-2" aria-hidden>
            {reviews.map((item, i) => (
              <span key={item.id} className="relative h-[2px] w-12 overflow-hidden bg-white/15">
                {i === index && <motion.span className="absolute inset-0 origin-left bg-sky" initial={{ scaleX: 0 }} animate={{ scaleX: paused ? 0.5 : 1 }} transition={{ duration: paused ? 0.3 : 6.5, ease: "linear" }} />}
                {i < index && <span className="absolute inset-0 bg-sky/60" />}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/reviews#write" className="inline-flex min-h-12 items-center rounded-full bg-sky px-6 font-semibold text-navy-deep transition hover:bg-white">Leave a review</Link>
            <a href={googleHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 font-semibold transition hover:border-white">Review us on Google</a>
          </div>
        </div>
      </div>
    </section>
  );
}
