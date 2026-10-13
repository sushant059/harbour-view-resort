"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight, Phone } from "lucide-react";
import { Magnetic } from "@/components/motion/primitives";
import { BackgroundVideo } from "@/components/photo";
import type { StockClip } from "@/lib/stock";

/** The closing scene: giant words slide in from both sides over the sunset film. */
export function Finale({ clip, phoneTel, phoneDisplay }: { clip: StockClip; phoneTel: string; phoneDisplay: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const a = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);
  const b = useTransform(scrollYProgress, [0, 1], ["30%", "0%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.3, 1]);
  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-navy-deep py-28 text-white md:py-40">
      <motion.div className="absolute inset-0 -z-20" style={{ scale }}><BackgroundVideo clip={clip} /></motion.div>
      <div className="absolute inset-0 -z-10 bg-navy-deep/65" aria-hidden />
      <div className="container-x text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-sky">Your harbour escape awaits</p>
        <h2 className="mt-8 font-display text-[16vw] font-light leading-[0.85] tracking-[-0.05em] md:text-[11vw]">
          <motion.span className="block" style={{ x: a }}>Stay with</motion.span>
          <motion.span className="block italic text-sky" style={{ x: b }}>the tide</motion.span>
        </h2>
        <p className="mx-auto mt-10 max-w-xl text-lg text-white/80">Book direct for our best rate, with free breakfast on stays of two nights or more.</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Magnetic>
            <Link href="/booking" data-cursor="Book" className="group grid h-36 w-36 place-items-center rounded-full bg-sky text-center font-semibold text-navy-deep transition hover:bg-white md:h-44 md:w-44">
              <span>Check<br />availability<ArrowUpRight className="mx-auto mt-2 h-5 w-5 transition group-hover:rotate-45" aria-hidden /></span>
            </Link>
          </Magnetic>
          <div className="flex flex-col gap-3">
            <button type="button" data-open-chat className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-6 font-semibold hover:bg-white/10">Ask our concierge</button>
            <a href={`tel:${phoneTel}`} className="inline-flex min-h-12 items-center justify-center gap-2 font-semibold text-white/85 hover:text-white"><Phone className="h-4 w-4" aria-hidden /> {phoneDisplay}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
