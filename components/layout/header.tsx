"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Phone } from "lucide-react";
import { Logo } from "@/components/brand";
import { lockScroll } from "@/components/motion/smooth-scroll";
import { Photo } from "@/components/photo";
import { SocialIcons } from "@/components/social";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { STOCK, type StockImage } from "@/lib/stock";
import type { Service, Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

type NavService = Pick<Service, "slug" | "title" | "category" | "icon">;

const MENU: { href: string; label: string; note: string; image: StockImage[] }[] = [
  { href: "/", label: "Home", note: "Welcome", image: STOCK.hero },
  { href: "/services", label: "Rooms & Suites", note: "Six ways to stay", image: STOCK.suite },
  { href: "/why-us", label: "The Resort", note: "Pools, spa & dining", image: STOCK.pool },
  { href: "/offers", label: "Packages", note: "Book direct offers", image: STOCK.breakfast },
  { href: "/results", label: "Gallery", note: "Moments, framed", image: STOCK.villa },
  { href: "/how-it-works", label: "Plan your stay", note: "Arrival to check-out", image: STOCK.lobby },
  { href: "/reviews", label: "Reviews", note: "Guest voices", image: STOCK.sunset },
  { href: "/contact", label: "Contact", note: "We’re here to help", image: STOCK.dining },
];

const EASE = [0.76, 0, 0.24, 1] as const;

export function Header({ settings, services }: { settings: Settings; services: NavService[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  useEffect(() => setMounted(true), []);

  useMotionValueEvent(scrollY, "change", (value) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(value > 40);
    // Slide away while reading down the page, come back as soon as they scroll up.
    setHidden(value > 320 && value > previous + 2);
    if (value < previous - 2) setHidden(false);
  });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
    };
  }, [open]);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <motion.header className="relative" animate={{ y: hidden && !open ? "-110%" : "0%" }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      <div className={cn("transition-[background-color,backdrop-filter,border-color] duration-500", scrolled ? "border-b border-white/10 bg-navy-deep/75 backdrop-blur-xl" : "border-b border-transparent bg-gradient-to-b from-navy-deep/60 to-transparent")}>
        <div className="container-x grid h-[84px] grid-cols-[1fr_auto_1fr] items-center gap-4 text-white">
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="site-menu" aria-label="Open menu" data-cursor="Menu" className="group flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em]">
              <span className="relative grid h-11 w-11 place-items-center rounded-full border border-white/30 transition group-hover:border-sky group-hover:bg-sky">
                <span className="absolute h-px w-4 -translate-y-[3px] bg-white transition group-hover:w-5 group-hover:bg-navy-deep" />
                <span className="absolute h-px w-4 translate-y-[3px] bg-white transition group-hover:w-3 group-hover:bg-navy-deep" />
              </span>
              <span className="hidden sm:inline">Menu</span>
            </button>
            <nav className="hidden items-center gap-6 xl:flex" aria-label="Primary">
              {[["/services", "Stay"], ["/why-us", "Resort"], ["/offers", "Packages"]].map(([href, label]) => (
                <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className="group relative py-2 text-[13px] font-medium uppercase tracking-[0.24em] text-white/85 hover:text-white">
                  {label}
                  <span className={cn("absolute bottom-0 left-0 h-px w-full origin-left bg-sky transition duration-500", active(href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
                </Link>
              ))}
            </nav>
          </div>
          <Logo tone="light" collapse />
          <div className="flex items-center justify-end gap-3">
            <a href={`tel:${settings.phoneTel}`} className="hidden items-center gap-2 text-[13px] font-medium tracking-wide text-white/85 hover:text-white lg:inline-flex">
              <Phone className="h-4 w-4 text-sky" aria-hidden /> {settings.phoneDisplay}
            </a>
            <Link href="/booking" data-cursor="Book" className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-sky px-4 text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-deep transition hover:bg-white sm:px-6">
              Book<span className="hidden sm:inline">&nbsp;now</span>
              <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      {/*
        The menu is rendered into <body>: the header's backdrop blur would otherwise trap a
        position:fixed panel inside the header bar.
      */}
      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              id="site-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              data-lenis-prevent
              className="fixed inset-0 z-[90] overflow-y-auto overscroll-contain bg-navy-deep text-white"
              initial={{ clipPath: "circle(0% at 48px 42px)" }}
              animate={{ clipPath: "circle(150% at 48px 42px)" }}
              exit={{ clipPath: "circle(0% at 48px 42px)" }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <div className="pointer-events-none absolute inset-0 hidden lg:left-[58%] lg:block" aria-hidden>
                <AnimatePresence mode="popLayout">
                  <motion.div key={hovered} className="absolute inset-0" initial={{ opacity: 0, scale: 1.12 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
                    <Photo stock={MENU[hovered].image} fill sizes="45vw" />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/30 to-transparent" />
                <motion.p key={`note-${hovered}`} className="absolute bottom-10 right-10 font-display text-3xl italic text-white/90" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                  {MENU[hovered].note}
                </motion.p>
              </div>

              <div className="container-x relative flex min-h-full flex-col">
                <div className="flex h-[84px] items-center justify-between">
                  <button type="button" onClick={() => setOpen(false)} className="group flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em]" aria-label="Close menu">
                    <span className="relative grid h-11 w-11 place-items-center rounded-full border border-white/30 transition group-hover:rotate-90 group-hover:border-sky">
                      <span className="absolute h-px w-4 rotate-45 bg-white" />
                      <span className="absolute h-px w-4 -rotate-45 bg-white" />
                    </span>
                    <span className="hidden sm:inline">Close</span>
                  </button>
                  <Logo tone="light" compact />
                </div>

                <nav className="mt-6 flex-1 lg:w-[54%]" aria-label="Site">
                  <ul>
                    {MENU.map((item, index) => (
                      <li key={item.href} className="overflow-hidden border-b border-white/10" onPointerEnter={() => setHovered(index)}>
                        <motion.div initial={{ y: "105%" }} animate={{ y: "0%" }} exit={{ y: "105%" }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.25 + index * 0.05 }}>
                          <Link href={item.href} onClick={() => setOpen(false)} onFocus={() => setHovered(index)} aria-current={active(item.href) ? "page" : undefined} className="group flex items-baseline gap-5 py-3 md:py-4">
                            <span className="w-8 font-display text-sm italic text-sky">{String(index + 1).padStart(2, "0")}</span>
                            <span className={cn("font-display text-[40px] font-light leading-none tracking-[-0.02em] transition duration-500 group-hover:translate-x-3 group-hover:italic group-hover:text-sky sm:text-6xl", active(item.href) && "italic text-sky")}>{item.label}</span>
                          </Link>
                        </motion.div>
                      </li>
                    ))}
                  </ul>
                  <motion.div className="mt-8 grid gap-6 sm:grid-cols-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.7, duration: 0.6 }}>
                    {SERVICE_CATEGORIES.map((category) => {
                      const items = services.filter((service) => service.category === category.id);
                      if (!items.length) return null;
                      return (
                        <div key={category.id}>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/45">{category.title}</p>
                          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                            {items.map((service) => <li key={service.slug}><Link href={`/services/${service.slug}`} onClick={() => setOpen(false)} className="text-white/75 hover:text-sky">{service.title}</Link></li>)}
                          </ul>
                        </div>
                      );
                    })}
                  </motion.div>
                </nav>

                <motion.div className="mt-10 flex flex-col gap-6 border-t border-white/10 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between lg:w-[54%]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.8 }}>
                  <div className="text-sm text-white/70">
                    <a href={`tel:${settings.phoneTel}`} className="block font-display text-2xl text-white hover:text-sky">{settings.phoneDisplay}</a>
                    <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a>
                  </div>
                  <div className="flex items-center gap-4">
                    <SocialIcons settings={settings} />
                    <Link href="/booking" onClick={() => setOpen(false)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-sky px-6 font-semibold text-navy-deep hover:bg-white">Book your stay <ArrowUpRight className="h-4 w-4" aria-hidden /></Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </motion.header>
  );
}
