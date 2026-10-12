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
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white text-navy shadow-card ring-1 ring-line" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <ArrowUp className="h-5 w-5" aria-hidden />
          </button>
        )}
        <a href={whatsappHref(settings)} target="_blank" rel="noopener noreferrer" className="hidden h-14 w-14 place-items-center rounded-full bg-whatsapp md:grid text-white shadow-soft transition hover:scale-105" aria-label="Chat on WhatsApp">
          <BrandIcon name="whatsapp" className="h-7 w-7" />
        </a>
        {!chatOpen && (
          <div className="hidden items-center gap-3 md:flex">
            {hint && (
              <button type="button" onClick={onChat} className="hidden animate-rise rounded-2xl rounded-br-sm bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-soft ring-1 ring-line md:block">
                Planning a stay? I can help 🌅
              </button>
            )}
            <button type="button" className="relative grid h-16 w-16 place-items-center rounded-full bg-navy text-white shadow-soft transition hover:scale-105" aria-label="Open booking assistant" onClick={onChat}>
              <MessageSquareText className="h-7 w-7" aria-hidden />
              <span className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-leaf" aria-hidden />
            </button>
          </div>
        )}
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Quick contact">
        <a href={`tel:${settings.phoneTel}`} className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-navy">
          <Phone className="h-5 w-5 text-brand" aria-hidden /> Call
        </a>
        <a href={whatsappHref(settings)} target="_blank" rel="noopener noreferrer" className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-navy">
          <BrandIcon name="whatsapp" className="h-5 w-5 text-[#1DA851]" /> WhatsApp
        </a>
        <button type="button" onClick={onChat} className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-navy">
          <MessageSquareText className="h-5 w-5 text-brand" aria-hidden /> Chat
        </button>
        <Link href="/booking" className="flex min-h-16 flex-col items-center justify-center gap-1 bg-navy text-xs font-semibold text-white">
          Book now
        </Link>
      </nav>
    </>
  );
}
