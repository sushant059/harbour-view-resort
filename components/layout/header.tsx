"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { Logo } from "@/components/brand";
import { ServiceIcon } from "@/components/icons";
import { SocialIcons } from "@/components/social";
import { NAV_LINKS, SERVICE_CATEGORIES } from "@/lib/constants";
import type { Service, Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

type NavService = Pick<Service, "slug" | "title" | "category" | "icon">;

export function Header({ settings, services }: { settings: Settings; services: NavService[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open && !mega) return;
    const previous = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setMega(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, mega]);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className={cn("relative border-b bg-white/90 backdrop-blur-xl transition", scrolled ? "border-line shadow-[0_8px_30px_-18px_rgba(11,47,94,.35)]" : "border-transparent")}>
      <div className="container-x flex h-[76px] items-center gap-4">
        <Logo />
        <nav className="ml-auto hidden items-center gap-0.5 xl:flex" aria-label="Primary">
          <div className="relative" onMouseLeave={() => setMega(false)}>
            <button
              type="button"
              className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-[15px] font-semibold text-navy hover:bg-brand-light", (active("/services") || mega) && "bg-brand-light text-brand")}
              aria-expanded={mega}
              aria-controls="mega-menu"
              onClick={() => setMega((value) => !value)}
              onMouseEnter={() => setMega(true)}
            >
              Stay <ChevronDown className={cn("h-4 w-4 transition", mega && "rotate-180")} aria-hidden />
            </button>
            {mega && (
              <div id="mega-menu" className="absolute left-1/2 top-full z-50 w-[860px] -translate-x-1/2 pt-3">
                <div className="grid grid-cols-4 gap-2 rounded-card border border-line bg-white p-3 shadow-soft">
                  {SERVICE_CATEGORIES.map((category) => (
                    <div key={category.id} className="rounded-2xl p-3 hover:bg-mist">
                      <Link href={`/services#${category.id}`} className="flex items-center gap-2 font-display text-[15px] font-bold text-navy hover:text-brand">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-light text-brand"><ServiceIcon name={category.icon} className="h-4 w-4" /></span>
                        {category.title}
                      </Link>
                      <ul className="mt-2 space-y-0.5">
                        {services.filter((service) => service.category === category.id).map((service) => (
                          <li key={service.slug}>
                            <Link href={`/services/${service.slug}`} className="block rounded-lg px-2 py-1.5 text-sm text-slate hover:bg-white hover:text-brand">{service.title}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {NAV_LINKS.filter((link) => link.href !== "/services").map((link) => (
            <Link key={link.href} href={link.href} aria-current={active(link.href) ? "page" : undefined} className={cn("whitespace-nowrap rounded-full px-3 py-2 text-[15px] font-semibold text-navy hover:bg-brand-light", active(link.href) && "bg-brand-light text-brand")}>
              {link.label}
            </Link>
          ))}
        </nav>
        <a href={`tel:${settings.phoneTel}`} className="ml-auto hidden items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 font-semibold text-navy hover:bg-brand-light md:inline-flex xl:hidden 2xl:ml-2 2xl:inline-flex">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-light text-brand"><Phone className="h-4 w-4" aria-hidden /></span>
          {settings.phoneDisplay}
        </a>
        <Link href="/booking" className="ml-auto hidden min-h-11 items-center whitespace-nowrap rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-navy-deep sm:inline-flex md:ml-0">
          Book now
        </Link>
        <button type="button" className="ml-auto grid h-12 w-12 place-items-center rounded-full bg-navy text-white sm:ml-0 xl:hidden" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
          {open ? <X aria-hidden /> : <Menu aria-hidden />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>
      {/*
        The menu is rendered into <body>: the header's backdrop blur would otherwise trap a
        position:fixed panel inside the 76px header bar, which is why it never appeared on phones.
      */}
      {mounted && open && createPortal(
        <div id="mobile-menu" className="fixed inset-0 z-[80] flex flex-col bg-white xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-[76px] shrink-0 items-center justify-between gap-3 border-b border-line px-4 sm:px-6">
            <Logo />
            <button type="button" className="grid h-12 w-12 place-items-center rounded-full bg-navy text-white" onClick={() => setOpen(false)} aria-label="Close menu">
              <X aria-hidden />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-5 sm:px-6" aria-label="Mobile">
            <p className="eyebrow">Stay & experience</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {SERVICE_CATEGORIES.map((category) => (
                <details key={category.id} className="group rounded-2xl border border-line bg-mist p-3 open:bg-white">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 font-display font-bold text-navy [&::-webkit-details-marker]:hidden">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-brand shadow-card"><ServiceIcon name={category.icon} className="h-4 w-4" /></span>
                    {category.title}
                    <ChevronDown className="ml-auto h-4 w-4 transition group-open:rotate-180" aria-hidden />
                  </summary>
                  <ul className="mt-2 grid gap-1 pl-12">
                    {services.filter((service) => service.category === category.id).map((service) => (
                      <li key={service.slug}><Link href={`/services/${service.slug}`} onClick={() => setOpen(false)} className="block py-2 text-slate hover:text-brand">{service.title}</Link></li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
            <ul className="mt-6 grid gap-1 border-t border-line pt-4">
              {NAV_LINKS.filter((link) => link.href !== "/services").map((link) => (
                <li key={link.href}><Link href={link.href} onClick={() => setOpen(false)} aria-current={active(link.href) ? "page" : undefined} className={cn("block rounded-2xl px-3 py-3 font-display text-xl font-bold text-navy hover:bg-brand-light", active(link.href) && "bg-brand-light text-brand")}>{link.label}</Link></li>
              ))}
              <li><Link href="/booking" onClick={() => setOpen(false)} className="block rounded-2xl px-3 py-3 font-display text-xl font-bold text-leaf-dark hover:bg-leaf-soft">Book your stay</Link></li>
            </ul>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href="/booking" onClick={() => setOpen(false)} className="inline-flex min-h-14 items-center justify-center rounded-full bg-navy font-semibold text-white">Check availability</Link>
              <a href={`tel:${settings.phoneTel}`} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-navy/15 font-bold text-navy"><Phone className="h-5 w-5" aria-hidden /> {settings.phoneDisplay}</a>
            </div>
            <SocialIcons settings={settings} tone="dark" className="mt-6" />
          </nav>
        </div>,
        document.body,
      )}
    </header>
  );
}
