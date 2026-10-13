"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Photo } from "@/components/photo";
import { wavePath as wave } from "@/components/motion/svg";
import type { StockImage } from "@/lib/stock";

export type DayMoment = { time: string; title: string; text: string; image: StockImage[]; href: string };

// Sky colours at each point of the day: top of the sky, horizon glow, water.
const STOPS = [0, 0.18, 0.4, 0.6, 0.78, 1];
const SKY_TOP = ["#2B3A5C", "#6FA8D6", "#3E8FD0", "#5B8FC0", "#2A1E44", "#050B14"];
const SKY_MID = ["#F2A27A", "#BFE0F5", "#A9D6F2", "#F4D29A", "#F07A3A", "#0E1A2A"];
const HORIZON = ["#FFD3A1", "#F4FAFF", "#E9F6FF", "#FBE3B0", "#FFC163", "#13262F"];
const WATER_TOP = ["#3C5A78", "#3F86B5", "#2F7FB4", "#3A7CA6", "#5B3550", "#07121B"];
const WATER_BOTTOM = ["#16263A", "#1C4F73", "#164B70", "#1D4865", "#1D1730", "#03080D"];
const LAND = ["#1E2A3C", "#2E4B5E", "#2B4A5C", "#34465A", "#1A1424", "#04080D"];

/**
 * A day at the resort, told by scrolling: the sun rises over the harbour, crosses the sky,
 * sets in orange behind the city, and the stars come out — while the moments of the day
 * (breakfast, the pool, the spa, sunset drinks, dinner) change alongside.
 */
export function DayCycle({ moments }: { moments: DayMoment[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 });
  const [stage, setStage] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (value) => setStage(Math.min(moments.length - 1, Math.floor(value * moments.length * 0.999))));

  const skyTop = useTransform(p, STOPS, SKY_TOP);
  const skyMid = useTransform(p, STOPS, SKY_MID);
  const horizon = useTransform(p, STOPS, HORIZON);
  const waterTop = useTransform(p, STOPS, WATER_TOP);
  const waterBottom = useTransform(p, STOPS, WATER_BOTTOM);
  const land = useTransform(p, STOPS, LAND);

  // The scene is drawn 1440 wide and cropped to fit the screen. On a phone only the middle shows,
  // so the sun's path, the moon and the palms are placed inside whatever part is visible.
  const view = useRef({ lo: 0, width: 1440 });
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const measure = () => {
      const el = box.current;
      if (!el) return;
      const width = Math.min(1440, (900 * el.clientWidth) / Math.max(1, el.clientHeight));
      view.current = { lo: 720 - width / 2, width };
      p.set(p.get() + 1e-6);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [p]);
  const sunX = useTransform(p, (value) => {
    const { lo, width } = view.current;
    const t = Math.min(1, Math.max(0, value / 0.82));
    return lo + width * (0.1 + 0.78 * t);
  });
  const moonX = useTransform(p, () => view.current.lo + view.current.width * 0.78);
  const palmShift = useTransform(p, () => Math.min(0, view.current.lo + view.current.width - 1440 + (view.current.width < 900 ? 60 : 0)));
  const sunY = useTransform(p, [0, 0.12, 0.4, 0.66, 0.82], [640, 420, 170, 330, 650]);
  const sunR = useTransform(p, [0, 0.4, 0.8], [64, 46, 78]);
  const sunColor = useTransform(p, [0, 0.15, 0.4, 0.7, 0.82], ["#FFB36B", "#FFF3D6", "#FFFFFF", "#FFD27A", "#FF7A2E"]);
  const sunGlow = useTransform(p, [0, 0.4, 0.78, 0.86], [0.75, 0.4, 0.95, 0]);
  const moonOpacity = useTransform(p, [0.82, 0.92], [0, 1]);
  const moonY = useTransform(p, [0.82, 1], [420, 190]);
  const stars = useTransform(p, [0.8, 0.95], [0, 1]);
  const birds = useTransform(p, [0.08, 0.2, 0.62, 0.72], [0, 1, 1, 0]);
  const birdsX = useTransform(p, [0, 1], [-200, 1700]);
  const boatX = useTransform(p, [0, 1], [-160, 1500]);
  const lights = useTransform(p, [0.7, 0.86], [0, 1]);
  const reflection = useTransform(p, [0, 0.4, 0.78, 0.86], [0.7, 0.35, 0.9, 0]);
  const moonReflection = useTransform(p, [0.86, 1], [0, 0.55]);
  const clouds = useTransform(p, [0, 1], [0, -260]);
  const shimmerX = useTransform(sunX, (value) => value - 40);
  const moonReflectionX = useTransform(moonX, (value) => value - 20);

  const moment = moments[stage];
  return (
    <section ref={ref} className="relative bg-navy-deep" style={{ height: `${moments.length * 85 + 40}vh` }} aria-label="A day at Harbour View">
      <div ref={box} className="sticky top-0 h-screen overflow-hidden">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            <motion.linearGradient id="dc-sky" x1="0" y1="0" x2="0" y2="1">
              <motion.stop offset="0" style={{ stopColor: skyTop }} />
              <motion.stop offset="0.62" style={{ stopColor: skyMid }} />
              <motion.stop offset="0.72" style={{ stopColor: horizon }} />
            </motion.linearGradient>
            <motion.linearGradient id="dc-water" x1="0" y1="0" x2="0" y2="1">
              <motion.stop offset="0" style={{ stopColor: waterTop }} />
              <motion.stop offset="1" style={{ stopColor: waterBottom }} />
            </motion.linearGradient>
            <radialGradient id="dc-glow">
              <stop offset="0" stopColor="#FFE2A8" stopOpacity="0.9" />
              <stop offset="1" stopColor="#FFE2A8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="dc-shimmer" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFE7B5" stopOpacity="0.9" />
              <stop offset="1" stopColor="#FFE7B5" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect width="1440" height="900" fill="url(#dc-sky)" />

          {/* Stars */}
          <motion.g style={{ opacity: stars }} fill="#fff">
            {Array.from({ length: 70 }, (_, i) => {
              const x = (i * 197) % 1440;
              const y = ((i * 113) % 520) + 10;
              return <circle key={i} cx={x} cy={y} r={i % 7 === 0 ? 1.8 : 1} className={i % 3 === 0 ? "animate-twinkle" : undefined} style={{ animationDelay: `${(i % 9) * 0.3}s`, transformOrigin: `${x}px ${y}px` }} />;
            })}
          </motion.g>

          {/* Sun + glow */}
          <motion.circle cx={sunX} cy={sunY} r={240} fill="url(#dc-glow)" style={{ opacity: sunGlow }} />
          <motion.circle cx={sunX} cy={sunY} r={sunR} style={{ fill: sunColor }} />

          {/* Moon */}
          <motion.g style={{ opacity: moonOpacity, x: moonX, y: moonY }}>
            <circle cx="0" cy="0" r="42" fill="#F4EFE6" />
            <circle cx="18" cy="-12" r="38" fill="#0B1522" opacity="0.92" />
          </motion.g>

          {/* Drifting clouds */}
          <motion.g style={{ x: clouds }} fill="#fff" opacity="0.18">
            <ellipse cx="300" cy="200" rx="140" ry="18" />
            <ellipse cx="380" cy="186" rx="90" ry="14" />
            <ellipse cx="980" cy="140" rx="170" ry="16" />
            <ellipse cx="1500" cy="250" rx="160" ry="14" />
          </motion.g>

          {/* Birds */}
          <motion.g style={{ opacity: birds, x: birdsX }} stroke="#13262F" strokeWidth="2.2" fill="none" strokeLinecap="round">
            <path d="M0 300q10-10 20 0q10-10 20 0" className="animate-floaty" />
            <path d="M50 270q8-8 16 0q8-8 16 0" className="animate-floaty" style={{ animationDelay: ".6s" }} />
            <path d="M30 330q7-7 14 0q7-7 14 0" className="animate-floaty" style={{ animationDelay: "1.2s" }} />
          </motion.g>

          {/* Far shore: Darwin city skyline */}
          <motion.path
            style={{ fill: land }}
            d="M0 640V598h40v-18h26v18h22v-40h30v40h18v-62h34v62h20v-28h28v28h40v-86h18v-14h20v14h16v86h30v-46h36v46h22v-30h30v30h44v-110h40v110h26v-58h30v58h38v-36h34v36h60v-20h80v20h70v-12h120v12h90v-24h60v24H1440V640Z"
          />
          {/* City lights after dark */}
          <motion.g style={{ opacity: lights }} fill="#FFD27A">
            {[[76, 572], [140, 556], [146, 580], [214, 590], [276, 530], [284, 556], [290, 582], [360, 570], [430, 580], [520, 500], [530, 530], [536, 560], [610, 560], [690, 600], [880, 610], [1000, 618]].map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="5" height="7" rx="1" />)}
          </motion.g>

          {/* Water */}
          <rect y="640" width="1440" height="260" fill="url(#dc-water)" />
          <motion.rect x={shimmerX} y="640" width="80" height="260" fill="url(#dc-shimmer)" style={{ opacity: reflection }} />
          <motion.rect x={moonReflectionX} y="640" width="40" height="200" fill="#F4EFE6" style={{ opacity: moonReflection }} />

          {/* Waves, always moving */}
          <g className="animate-wave" opacity="0.35" stroke="#fff" strokeWidth="1.5" fill="none">
            <path d={wave(680, 60, 8)} />
          </g>
          <g className="animate-wave-slow" opacity="0.22" stroke="#fff" strokeWidth="1.2" fill="none">
            <path d={wave(730, 90, 10)} />
            <path d={wave(800, 120, 12)} />
          </g>

          {/* A yacht crossing the harbour */}
          <motion.g style={{ x: boatX }}>
            <g className="animate-bob">
              <path d="M0 700h120l-18 18H14Z" fill="#F4EFE6" />
              <path d="M60 696V600l44 96Z" fill="#F4EFE6" opacity="0.92" />
              <path d="M56 696V616l-34 80Z" fill="#F4EFE6" opacity="0.7" />
              <motion.circle cx="60" cy="596" r="3" fill="#FFD27A" style={{ opacity: lights }} />
            </g>
          </motion.g>

          {/* Foreground palms */}
          <motion.g style={{ fill: land, x: palmShift }}>
            <path d="M1290 900c6-120 2-210-14-300l10-2c18 90 22 182 16 302Z" />
            <g className="origin-[1282px_600px] animate-sway">
              <path d="M1282 600c-60-30-120-24-170 10 60-12 110-6 170-6Z" />
              <path d="M1282 600c40-60 100-80 160-70-60 14-110 40-158 76Z" />
              <path d="M1282 600c-20-60-70-100-130-110 50 30 90 66 126 112Z" />
              <path d="M1282 600c60-10 120 14 158 60-50-30-100-44-160-56Z" />
              <path d="M1282 600c-50 10-96 44-120 96 34-40 76-70 122-92Z" />
            </g>
            <path d="M1380 900c2-90-4-160-20-230l9-2c18 70 24 142 22 232Z" />
            <g className="origin-[1364px_668px] animate-sway" style={{ animationDelay: "-2s" }}>
              <path d="M1364 668c-50-24-100-18-140 8 50-10 92-4 140-4Z" />
              <path d="M1364 668c34-48 84-64 134-56-50 12-92 32-132 62Z" />
              <path d="M1364 668c50-8 100 12 132 50-42-24-84-36-134-46Z" />
            </g>
          </motion.g>
        </svg>

        {/* Soft vignette so the words read on any sky */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/70 via-navy-deep/10 to-transparent" aria-hidden />

        <div className="container-x relative flex h-full flex-col justify-between py-24 text-white md:py-28">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-sky"><span className="h-px w-10 bg-sky" /> A day at Harbour View</p>
              <div className="relative mt-4 h-[96px] overflow-hidden md:h-[160px]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p key={moment.time} className="font-display text-[88px] font-light leading-none tracking-[-0.04em] tabular-nums md:text-[150px]" initial={{ y: "100%", opacity: 0 }} animate={{ y: "0%", opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                    {moment.time}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
            <ol className="mt-2 hidden flex-col gap-3 md:flex" aria-label="Moments of the day">
              {moments.map((item, index) => (
                <li key={item.time} className="flex items-center justify-end gap-3 text-xs uppercase tracking-[0.24em]">
                  <span className={index === stage ? "text-white" : "text-white/40"}>{item.time}</span>
                  <motion.span className="block h-px bg-sky" animate={{ width: index === stage ? 48 : 14, opacity: index === stage ? 1 : 0.4 }} />
                </li>
              ))}
            </ol>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={moment.title} className="grid max-w-3xl gap-5 rounded-[26px] bg-navy-deep/45 p-4 ring-1 ring-white/15 backdrop-blur-md sm:grid-cols-[180px_1fr] sm:p-5" initial={{ opacity: 0, y: 40, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -30, filter: "blur(8px)" }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <div className="relative hidden aspect-square overflow-hidden rounded-[18px] sm:block">
                <Photo stock={moment.image} alt={moment.title} fill sizes="180px" className="animate-kenburns" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-display text-3xl font-medium md:text-4xl">{moment.title}</h3>
                <p className="mt-2 text-white/80">{moment.text}</p>
                <Link href={moment.href} className="group mt-4 inline-flex items-center gap-2 self-start text-sm font-semibold text-sky">
                  Discover <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" aria-hidden />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
