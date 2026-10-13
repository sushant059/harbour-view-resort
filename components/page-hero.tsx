"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { SplitWords } from "@/components/motion/primitives";
import { Photo } from "@/components/photo";
import { STOCK, type StockImage } from "@/lib/stock";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A circle of text turning slowly, like a stamp on a postcard. */
export function SpinningBadge({ text = "Harbour View · Darwin Waterfront · ", className }: { text?: string; className?: string }) {
  return (
    <div className={className} aria-hidden>
      <svg viewBox="0 0 200 200" className="h-full w-full animate-spin-slow">
        <defs><path id="badge-circle" d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0" /></defs>
        <text fill="currentColor" fontSize="14" fontFamily="var(--font-body)">
          <textPath href="#badge-circle" textLength="486" lengthAdjust="spacing">{text.toUpperCase()}</textPath>
        </text>
      </svg>
      <svg viewBox="0 0 24 24" className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-sky"><path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" /></svg>
    </div>
  );
}

export function PageHero({ eyebrow, title, lede, children, crumbs, image = STOCK.pool, src, compact = false }: { eyebrow: string; title: string; lede: string; children?: React.ReactNode; crumbs?: { href: string; label: string }[]; image?: StockImage[]; src?: string; compact?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  return (
    <header ref={ref} className={cn("relative isolate flex items-end overflow-hidden bg-navy-deep text-white", compact ? "min-h-[58svh]" : "min-h-[78svh]")}>
      <motion.div className="absolute inset-0 -z-20" style={{ y, scale }} initial={{ clipPath: "inset(8% 8% 8% 8% round 32px)" }} animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }} transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}>
        <Photo src={src} stock={image} fill priority sizes="100vw" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep via-navy-deep/55 to-navy-deep/40" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep/70 to-transparent" aria-hidden />
      <SpinningBadge className="pointer-events-none absolute right-6 top-28 hidden h-32 w-32 text-white/60 md:block lg:right-12 lg:h-40 lg:w-40" />
      <motion.div style={{ y: textY, opacity: fade }} className="container-x relative pb-16 pt-36 md:pb-24">
        {crumbs && (
          <motion.nav aria-label="Breadcrumb" className="mb-8 text-[11px] uppercase tracking-[0.28em] text-white/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }}>
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              {crumbs.map((crumb) => (
                <li key={crumb.href} className="flex items-center gap-2"><span aria-hidden className="h-px w-4 bg-white/40" /><Link href={crumb.href} className="hover:text-white">{crumb.label}</Link></li>
              ))}
            </ol>
          </motion.nav>
        )}
        <motion.p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-sky" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.9, ease: EASE }}>
          <span className="h-px w-10 bg-sky" /> {eyebrow}
        </motion.p>
        <SplitWords as="h1" text={title} delay={0.55} stagger={0.07} className={cn("mt-6 max-w-5xl font-display font-light tracking-[-0.03em]", compact ? "text-[44px] sm:text-6xl lg:text-[84px]" : "text-[48px] sm:text-7xl lg:text-[104px]", "leading-[0.98]")} />
        <motion.p className="mt-7 max-w-2xl text-lg font-light text-white/80 md:text-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1, ease: EASE }}>{lede}</motion.p>
        {children && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 1, ease: EASE }}>{children}</motion.div>}
      </motion.div>
    </header>
  );
}
