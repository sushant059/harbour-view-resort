"use client";

import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { wavePath } from "@/components/motion/svg";
import { Car, Clock, MapPin, Plane } from "lucide-react";

/**
 * "Getting here" as a little animated map: as you scroll, a gold route draws itself from
 * Darwin Airport to the resort on the waterfront, and the stops light up.
 */
export function Journey({ address }: { address: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  const draw = useTransform(scrollYProgress, [0.05, 0.8], [0, 1]);
  const pinA = useTransform(scrollYProgress, [0, 0.1], [0.3, 1]);
  const pinB = useTransform(scrollYProgress, [0.75, 0.85], [0.3, 1]);
  const ring = useTransform(scrollYProgress, [0.78, 1], [0, 1]);
  const ringFade = useTransform(ring, [0, 1], [0.9, 0]);
  const path = useRef<SVGPathElement>(null);
  const carX = useMotionValue(120);
  const carY = useMotionValue(110);
  const carAngle = useMotionValue(0);
  // Put the little car on the route at the same point the gold line has reached.
  useMotionValueEvent(draw, "change", (value) => {
    const line = path.current;
    if (!line) return;
    const length = line.getTotalLength();
    const at = Math.max(0, Math.min(1, value)) * length;
    const point = line.getPointAtLength(at);
    const ahead = line.getPointAtLength(Math.min(length, at + 2));
    carX.set(point.x);
    carY.set(point.y);
    carAngle.set((Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI);
  });
  const route = "M120 110C220 140 260 210 300 260S420 330 470 380 560 430 610 520";

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#F4EFE6] py-24 md:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-brand"><span className="h-px w-10 bg-brand" /> Getting here</p>
          <h2 className="mt-6 font-display text-5xl font-medium leading-[0.95] tracking-[-0.03em] text-navy md:text-7xl">Fifteen minutes <em className="font-light text-brand">from</em> touchdown</h2>
          <p className="mt-6 max-w-lg text-lg text-slate">{address}. Walk to the wave lagoon, restaurants and the city centre; Mindil Beach sunset markets are a short drive away.</p>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-[22px] border border-navy/10 bg-navy/10 sm:grid-cols-2">
            {[
              [Plane, "Darwin Airport", "About 15 minutes by car"],
              [Car, "Private transfers", "Meet and greet, any flight"],
              [Clock, "Check-in / out", "From 2pm / by 11am"],
              [MapPin, "City centre", "A 5-minute walk"],
            ].map(([Icon, title, text], index) => {
              const I = Icon as typeof Plane;
              return (
                <motion.li key={title as string} className="bg-[#F4EFE6] p-5" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.8 }}>
                  <I className="h-5 w-5 text-brand" aria-hidden />
                  <p className="mt-3 font-display text-xl text-navy">{title as string}</p>
                  <p className="text-sm text-slate">{text as string}</p>
                </motion.li>
              );
            })}
          </ul>
        </div>

        <div className="relative aspect-[4/3.4] overflow-hidden rounded-[30px] bg-navy-deep shadow-soft">
          <svg viewBox="0 0 720 620" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <pattern id="jr-grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0v36" fill="none" stroke="rgba(255,255,255,.05)" /></pattern>
              <linearGradient id="jr-sea" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#1C4F73" /><stop offset="1" stopColor="#0B2A40" /></linearGradient>
            </defs>
            <rect width="720" height="620" fill="#13262F" />
            <rect width="720" height="620" fill="url(#jr-grid)" />
            {/* Harbour */}
            <path d="M720 300C640 330 600 400 640 470S620 620 520 620H720Z" fill="url(#jr-sea)" />
            <path d="M0 620V520C60 500 120 540 160 600L170 620Z" fill="url(#jr-sea)" opacity=".7" />
            <g className="animate-wave-slow" stroke="rgba(255,255,255,.18)" fill="none">
              <path d={wavePath(560, 40, 6, 720)} />
            </g>
            {/* Roads */}
            <path d="M0 200C180 220 300 160 420 220S640 260 720 240" stroke="rgba(255,255,255,.08)" strokeWidth="10" fill="none" />
            <path d="M260 0C280 160 340 300 300 620" stroke="rgba(255,255,255,.06)" strokeWidth="8" fill="none" />
            <path ref={path} d={route} stroke="rgba(255,255,255,.14)" strokeWidth="6" fill="none" strokeLinecap="round" />
            {/* The route drawing itself */}
            <motion.path d={route} stroke="#D9B77E" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="0 1" style={{ pathLength: draw }} />
            {/* Airport */}
            <motion.g style={{ opacity: pinA }}>
              <circle cx="120" cy="110" r="26" fill="rgba(217,183,126,.15)" />
              <circle cx="120" cy="110" r="9" fill="#D9B77E" />
              <text x="150" y="104" fill="#F4EFE6" fontSize="18" fontFamily="var(--font-display)">Darwin Airport</text>
              <text x="150" y="126" fill="rgba(244,239,230,.55)" fontSize="12" letterSpacing="3">DRW · 00:00</text>
            </motion.g>
            {/* Resort */}
            <motion.circle cx="610" cy="520" r="40" fill="none" stroke="#D9B77E" strokeWidth="1.5" style={{ scale: ring, opacity: ringFade, transformOrigin: "610px 520px" }} />
            <motion.g style={{ opacity: pinB }}>
              <circle cx="610" cy="520" r="14" fill="#D9B77E" />
              <circle cx="610" cy="520" r="5" fill="#13262F" />
              <text x="440" y="470" fill="#F4EFE6" fontSize="20" fontFamily="var(--font-display)">Harbour View</text>
              <text x="440" y="492" fill="rgba(244,239,230,.55)" fontSize="12" letterSpacing="3">WATERFRONT · 00:15</text>
            </motion.g>
            {/* The car riding the route */}
            <motion.g style={{ x: carX, y: carY, rotate: carAngle }}>
              <circle r="13" fill="#D9B77E" />
              <path d="M-6-3h8l3 3-3 3h-8Z" fill="#13262F" />
            </motion.g>
          </svg>
        </div>
      </div>
    </section>
  );
}
