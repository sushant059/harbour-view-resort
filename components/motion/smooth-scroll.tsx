"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { MotionConfig } from "motion/react";

/**
 * Buttery smooth scrolling on desktop (Lenis), native scrolling on touch screens, and none at all
 * when the visitor asks for reduced motion. MotionConfig makes every animation respect that too.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.085, wheelMultiplier: 0.9, anchors: { offset: -90 } });
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;
    document.documentElement.classList.add("lenis");
    return () => {
      lenis.destroy();
      document.documentElement.classList.remove("lenis");
      delete (window as Window & { __lenis?: Lenis }).__lenis;
    };
  }, []);

  // New page: start at the top, without a smooth glide from the old position.
  useEffect(() => {
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    if (lenis && !window.location.hash) lenis.scrollTo(0, { immediate: true });
  }, [pathname]);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Pause smooth scrolling while a modal (menu, chat) is open so the page behind stays put. */
export function lockScroll(locked: boolean) {
  const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}
