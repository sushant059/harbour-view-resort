"use client";

import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A heading whose words rise out of a mask, one after another, when it scrolls into view. */
export function SplitWords({ text, className, delay = 0, as = "h2", stagger = 0.06, once = true }: { text: string; className?: string; delay?: number; as?: "h1" | "h2" | "h3" | "p" | "span"; stagger?: number; once?: boolean }) {
  const Tag = motion[as];
  const words = text.split(" ");
  return (
    <Tag className={className} initial="hidden" whileInView="show" viewport={{ once, margin: "0px 0px -10% 0px" }} aria-label={text}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} aria-hidden>
          <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
            <motion.span
              className="inline-block will-change-transform"
              variants={{ hidden: { y: "110%", rotate: 4 }, show: { y: "0%", rotate: 0, transition: { duration: 1, ease: EASE, delay: delay + index * stagger } } }}
            >
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}

/** Letters that drop in one by one, for the big hero line. */
export function SplitChars({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  let position = 0;
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, w, all) => (
        <span key={w} aria-hidden>
          <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top">
            {[...word].map((char) => {
              const i = position++;
              return (
                <motion.span key={i} className="inline-block" initial={{ y: "115%", opacity: 0 }} animate={{ y: "0%", opacity: 1 }} transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.028 }}>
                  {char}
                </motion.span>
              );
            })}
          </span>
          {w < all.length - 1 && " "}
        </span>
      ))}
    </span>
  );
}

/** Fade + rise (+ a touch of blur) into view. */
export function Reveal({ children, className, delay = 0, y = 40, blur = true, once = true }: { children: React.ReactNode; className?: string; delay?: number; y?: number; blur?: boolean; once?: boolean }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? "blur(10px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** An image frame that wipes open (like a curtain) and settles from a slight zoom. */
export function ClipReveal({ children, className, delay = 0, from = "bottom" }: { children: React.ReactNode; className?: string; delay?: number; from?: "bottom" | "left" | "right" | "center" }) {
  const hidden = { bottom: "inset(100% 0 0 0)", left: "inset(0 100% 0 0)", right: "inset(0 0 0 100%)", center: "inset(20% 20% 20% 20% round 40px)" }[from];
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      initial={{ clipPath: hidden }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay }}
    >
      <motion.div className="absolute inset-0" initial={{ scale: 1.25 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: EASE, delay }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Moves its content slower or faster than the page as it scrolls past. */
export function Parallax({ children, className, speed = 0.2 }: { children: React.ReactNode; className?: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div className="absolute inset-[-20%_0]" style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

/** Buttons that lean toward the mouse. */
export function Magnetic({ children, className, strength = 0.35 }: { children: React.ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x, y }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse" || !ref.current) return;
        const box = ref.current.getBoundingClientRect();
        x.set((event.clientX - box.left - box.width / 2) * strength);
        y.set((event.clientY - box.top - box.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** A card that tilts in 3D under the mouse, with a moving sheen. */
export function Tilt({ children, className, max = 8 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 200, damping: 20 });
  const ry = useSpring(0, { stiffness: 200, damping: 20 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const sheen = useTransform([gx, gy] as MotionValue<number>[], ([a, b]: number[]) => `radial-gradient(circle at ${a}% ${b}%, rgba(255,240,210,.22), transparent 55%)`);
  return (
    <motion.div
      ref={ref}
      className={cn("relative [transform-style:preserve-3d]", className)}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse" || !ref.current) return;
        const box = ref.current.getBoundingClientRect();
        const px = (event.clientX - box.left) / box.width;
        const py = (event.clientY - box.top) / box.height;
        ry.set((px - 0.5) * max * 2);
        rx.set(-(py - 0.5) * max * 2);
        gx.set(px * 100);
        gy.set(py * 100);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
      <motion.span className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 [div:hover>&]:opacity-100" style={{ background: sheen }} aria-hidden />
    </motion.div>
  );
}

/** Counts up to a number once it's on screen. Keeps any prefix/suffix, e.g. "15 min" or "$329". */
export function CountUp({ value, className, duration = 1.8 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const match = value.match(/^(\D*)([\d,.]+)(.*)$/);
  const target = match ? Number(match[2].replace(/,/g, "")) : 0;
  const [shown, setShown] = useState(match ? 0 : target);
  useEffect(() => {
    if (!inView || !match) return;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / (duration * 1000));
      setShown(target * (1 - Math.pow(1 - progress, 4)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  if (!match) return <span className={className}>{value}</span>;
  const decimals = match[2].includes(".") ? match[2].split(".")[1].length : 0;
  return (
    <span ref={ref} className={className} aria-label={value}>
      {match[1]}
      {shown.toLocaleString("en-AU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {match[3]}
    </span>
  );
}

/** Thin gold bar across the top showing how far down the page you are. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-brand via-sky to-sun" style={{ scaleX }} />;
}
