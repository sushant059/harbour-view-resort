"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUp, MessageSquareText, Phone } from "lucide-react";
import { BrandIcon, whatsappHref } from "@/components/social";
import type { Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FloatingActions({ settings, onChat, chatOpen }: { settings: Settings; onChat: () => void; chatOpen: boolean }) {
  const [showTop, setShowTop] = useState(false);
  const [hint, setHint] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = window.setTimeout(() => setHint(true), 6000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, []);
  return (
    <>
      <div className={cn("fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6", chatOpen && "hidden md:flex")}>
        {showTop && (
          <button type="button" className="hidden h-11 w-11 place-items-center rounded-full bg-navy-deep/80 text-sky md:grid shadow-card ring-1 ring-white/15 backdrop-blur transition hover:bg-sky hover:text-navy-deep" aria-label="Back to top" onClick={() => { const lenis = (window as Window & { __lenis?: { scrollTo: (target: number) => void } }).__lenis; if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <ArrowUp className="h-5 w-5" aria-hidden />
          </button>
        )}
        <a href={whatsappHref(settings)} target="_blank" rel="noopener noreferrer" className="hidden h-14 w-14 place-items-center rounded-full bg-whatsapp md:grid text-white shadow-soft transition hover:scale-105" aria-label="Chat on WhatsApp">
          <BrandIcon name="whatsapp" className="h-7 w-7" />
        </a>
        {!chatOpen && (
          <div className="hidden items-center gap-3 md:flex">
            {hint && (
              <button type="button" onClick={onChat} className="hidden animate-rise rounded-2xl rounded-br-sm bg-navy-deep/90 px-4 py-2.5 text-sm font-medium text-white shadow-soft ring-1 ring-white/10 backdrop-blur md:block">
                Planning a stay? I can help 🌅
              </button>
            )}
            <button type="button" className="relative grid h-16 w-16 place-items-center rounded-full bg-sky text-navy-deep shadow-soft transition hover:scale-105 hover:bg-white" aria-label="Open booking assistant" onClick={onChat}>
              <MessageSquareText className="h-7 w-7" aria-hidden />
              <span className="absolute inset-0 animate-ping rounded-full border border-sky/60 [animation-duration:2.6s]" aria-hidden />
            </button>
          </div>
        )}
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-white/10 bg-navy-deep/90 pb-[env(safe-area-inset-bottom)] text-white backdrop-blur-xl md:hidden" aria-label="Quick contact">
        <a href={`tel:${settings.phoneTel}`} className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold">
          <Phone className="h-5 w-5 text-sky" aria-hidden /> Call
        </a>
        <a href={whatsappHref(settings)} target="_blank" rel="noopener noreferrer" className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold">
          <BrandIcon name="whatsapp" className="h-5 w-5 text-whatsapp" /> WhatsApp
        </a>
        <button type="button" onClick={onChat} className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold">
          <MessageSquareText className="h-5 w-5 text-sky" aria-hidden /> Chat
        </button>
        <Link href="/booking" className="flex min-h-16 flex-col items-center justify-center gap-1 bg-sky text-xs font-semibold uppercase tracking-[0.16em] text-navy-deep">
          Book now
        </Link>
      </nav>
    </>
  );
}
