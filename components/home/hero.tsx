"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowDownRight, ArrowRight, Sparkles, Star } from "lucide-react";
import { HeroSearch } from "@/components/home/interactive";
import { Magnetic, SplitChars } from "@/components/motion/primitives";
import { BackgroundVideo, Photo } from "@/components/photo";
import type { StockClip } from "@/lib/stock";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Full-screen film of the resort. On scroll the footage drifts down and zooms while the words
 * lift away, so the page seems to sink into the water.
 */
export function CinematicHero({ headline, subtext, heroImage, heroIsPhoto, clip, today, checkIn, checkOut }: { headline: string; subtext: string; heroImage: string; heroIsPhoto: boolean; clip: StockClip; today: string; checkIn: string; checkOut: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.22]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-45%"]);
  const fade = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const veil = useTransform(scrollYProgress, [0, 1], [0.35, 0.85]);

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] overflow-hidden bg-navy-deep text-white" data-hero>
      <motion.div className="absolute inset-0 -z-20" style={{ y: mediaY, scale: mediaScale }}>
        {heroIsPhoto ? <Photo src={heroImage} fill priority sizes="100vw" /> : <BackgroundVideo clip={clip} src={heroImage} />}
      </motion.div>
      <motion.div className="absolute inset-0 -z-10 bg-navy-deep" style={{ opacity: veil }} aria-hidden />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_110%,rgba(11,23,29,.95),transparent_70%)]" aria-hidden />

      {/* Thin frame lines, like a viewfinder */}
      <div className="pointer-events-none absolute inset-4 hidden rounded-[28px] border border-white/10 md:block lg:inset-6" aria-hidden />

      <motion.div style={{ y: textY, opacity: fade }} className="container-x relative flex min-h-[100svh] flex-col justify-end pb-8 pt-36 md:pb-10">
        <motion.div className="mb-6 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-sky" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35, ease: EASE }}>
          <span className="h-px w-10 bg-sky" /> Darwin Waterfront<span className="hidden sm:inline"> · Northern Territory</span>
        </motion.div>

        <h1 className="max-w-6xl font-display text-[54px] font-medium leading-[0.92] tracking-[-0.03em] sm:text-[84px] lg:text-[108px] xl:text-[120px]">
          <SplitChars text={headline} delay={0.45} />
        </h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <motion.p className="max-w-lg text-lg font-light leading-relaxed text-white/80 md:text-xl" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 1.1, ease: EASE }}>
            {subtext}
          </motion.p>
          <motion.div className="flex flex-wrap items-center gap-4" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 1.25, ease: EASE }}>
            <Magnetic>
              <Link href="/services" data-cursor="Explore" className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-sky pl-7 pr-2 text-[15px] font-semibold text-navy-deep transition hover:bg-white">
                Explore the resort
                <span className="grid h-10 w-10 place-items-center rounded-full bg-navy-deep text-sky transition group-hover:rotate-[-45deg]"><ArrowRight className="h-4 w-4" aria-hidden /></span>
              </Link>
            </Magnetic>
            <button type="button" data-open-chat className="inline-flex min-h-14 items-center gap-2 rounded-full border border-white/25 px-6 text-[15px] font-semibold text-white backdrop-blur-sm transition hover:border-white hover:bg-white/10">
              <Sparkles className="h-4 w-4 text-sky" aria-hidden /> Ask the concierge
            </button>
          </motion.div>
        </div>

        <motion.div className="mt-8" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 1.45, ease: EASE }}>
          <HeroSearch today={today} tomorrow={checkIn} later={checkOut} />
        </motion.div>

        <motion.div className="mt-6 hidden items-center justify-between text-xs uppercase tracking-[0.3em] text-white/55 md:flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9, duration: 1 }}>
          <span className="flex items-center gap-2"><Star className="h-3.5 w-3.5 fill-sky text-sky" aria-hidden /> Five-star waterfront living</span>
          <span className="flex items-center gap-3">
            Scroll to arrive
            <span className="relative block h-10 w-6 rounded-full border border-white/35">
              <motion.span className="absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded-full bg-sky" animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} />
            </span>
          </span>
          <span className="flex items-center gap-2">12°27′S 130°50′E <ArrowDownRight className="h-3.5 w-3.5" aria-hidden /></span>
        </motion.div>
      </motion.div>
    </section>
  );
}
