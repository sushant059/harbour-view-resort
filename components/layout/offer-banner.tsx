"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import type { Settings } from "@/lib/types";

/** The current offer, as a small card that glides in at the bottom of the screen a moment after arriving. */
export function OfferBanner({ id, text, href }: { id: string; text: string; href: string; settings?: Settings }) {
  const key = `hvr-banner-${id}-${text}`;
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let hiddenBefore = false;
    try {
      hiddenBefore = window.localStorage.getItem(key) === "hidden";
    } catch {}
    if (hiddenBefore) return;
    // Shown once per visit, for a little while, so it never sits on top of the page for long.
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(key) === "seen";
      window.sessionStorage.setItem(key, "seen");
    } catch {}
    if (seen) return;
    const show = window.setTimeout(() => setVisible(true), 3200);
    const hide = window.setTimeout(() => setVisible(false), 16000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [key]);
  const dismiss = () => {
    try {
      window.localStorage.setItem(key, "hidden");
    } catch {}
    setVisible(false);
  };
  return (
    <AnimatePresence>
      {visible && text && (
        <motion.aside
          className="fixed inset-x-3 bottom-[84px] z-40 md:inset-x-auto md:bottom-6 md:left-6 md:max-w-sm"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Current offer"
        >
          <div className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-navy-deep/90 p-4 pr-3 text-white shadow-soft backdrop-blur-xl">
            <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky/15 font-display text-lg italic text-sky">%</span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-sky">Book direct</p>
              <Link href={href || "/offers"} onClick={() => setVisible(false)} className="group mt-1 block font-display text-lg leading-snug hover:text-sky">
                {text} <ArrowUpRight className="inline h-4 w-4 transition group-hover:rotate-45" aria-hidden />
              </Link>
            </div>
            <button type="button" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white" aria-label="Dismiss offer" onClick={dismiss}>
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
