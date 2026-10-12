"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Sparkle } from "@/components/art/sparkle";
import { SocialIcons } from "@/components/social";
import type { Settings } from "@/lib/types";

export function OfferBanner({ id, text, href, settings }: { id: string; text: string; href: string; settings: Settings }) {
  const key = `snt-banner-${id}-${text}`;
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(key) !== "hidden");
    } catch {
      setVisible(true);
    }
  }, [key]);
  if (!visible || !text) return null;
  return (
    <div className="bg-navy text-white">
      <div className="container-x flex min-h-10 items-center gap-3 py-1.5 text-sm">
        <Sparkle className="h-4 w-4 shrink-0 text-sun" animated />
        <Link href={href || "/offers"} className="flex-1 font-semibold underline-offset-4 hover:underline">
          {text} <span className="hidden text-sky-soft sm:inline">→ See offer</span>
        </Link>
        <SocialIcons settings={settings} size="sm" className="hidden md:flex" />
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"
          aria-label="Dismiss offer"
          onClick={() => {
            try {
              window.localStorage.setItem(key, "hidden");
            } catch {}
            setVisible(false);
          }}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
