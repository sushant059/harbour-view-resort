"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

/** Wraps content that fades up when scrolled into view. Visible by default without JS. */
export function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div data-reveal className={cn("min-w-0", className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

/** One observer for the whole page, re-run after each client navigation. */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"));
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
