"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgePercent, Menu, Receipt, Sunrise, X, CalendarDays, ExternalLink, Images, Inbox, LayoutDashboard, ListChecks, LogOut, MessageSquareQuote, Send, Settings, SquareStack, Users } from "lucide-react";
import { Logo } from "@/components/brand";
import { logoutAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

const LINKS = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/calendar", "Occupancy", CalendarDays],
  ["/admin/leads", "Enquiries & bookings", Inbox],
  ["/admin/customers", "Guests & stays", Users],
  ["/admin/invoices", "Invoices", Receipt],
  ["/admin/messages", "Send offers", Send],
  ["/admin/reviews", "Reviews", MessageSquareQuote],
  ["/admin/services", "Rooms & experiences", SquareStack],
  ["/admin/media", "Gallery & media", Images],
  ["/admin/day", "A day at the resort", Sunrise],
  ["/admin/offers", "Offers & promos", BadgePercent],
  ["/admin/faqs", "FAQs", ListChecks],
  ["/admin/settings", "Settings", Settings],
] as const;

export function AdminShell({ children, badges = {} }: { children: React.ReactNode; badges?: Record<string, number> }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const current = LINKS.find(([href]) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)));
  const totalBadges = Object.values(badges).reduce((sum, value) => sum + (value || 0), 0);

  const nav = (
    <nav className="space-y-1 px-3 pb-6" aria-label="Admin">
      {LINKS.map(([href, label, Icon]) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        const badge = badges[href];
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition md:text-sm", active ? "bg-navy text-white" : "text-navy hover:bg-mist")}>
            <Icon className="h-5 w-5 md:h-4 md:w-4" aria-hidden /> {label}
            {badge ? <span className="ml-auto rounded-full bg-sun px-2 text-xs font-bold text-navy">{badge}</span> : null}
          </Link>
        );
      })}
      <div className="border-t border-line pt-2" />
      <Link href="/" target="_blank" className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-brand hover:bg-mist md:text-sm"><ExternalLink className="h-5 w-5 md:h-4 md:w-4" aria-hidden /> View website</Link>
      <button type="button" className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-slate hover:bg-mist md:text-sm" onClick={async () => { await logoutAction(); router.push("/admin/login"); router.refresh(); }}><LogOut className="h-5 w-5 md:h-4 md:w-4" aria-hidden /> Log out</button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-mist md:grid md:grid-cols-[260px_1fr]">
      {/* Phone: top bar with a menu button */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-white px-4 md:hidden">
        <button type="button" onClick={() => setOpen(true)} className="relative grid h-11 w-11 place-items-center rounded-full bg-navy text-white" aria-label="Open admin menu" aria-expanded={open}>
          <Menu className="h-5 w-5" aria-hidden />
          {totalBadges > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-sun px-1 text-[11px] font-bold text-navy">{totalBadges}</span>}
        </button>
        <span className="min-w-0 truncate font-display text-lg font-bold text-navy">{current?.[1] ?? "Admin"}</span>
        <span className="ml-auto rounded-full bg-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Admin</span>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" className="absolute inset-0 bg-navy-deep/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(320px,86vw)] flex-col bg-white shadow-soft">
            <div className="flex items-center justify-between gap-2 px-4 py-4">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-mist text-navy" aria-label="Close menu"><X className="h-5 w-5" aria-hidden /></button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain">{nav}</div>
          </div>
        </div>
      )}
      {/* Tablet and desktop: fixed sidebar */}
      <aside className="hidden border-r border-line bg-white md:sticky md:top-0 md:block md:h-screen md:overflow-y-auto">
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <Logo />
          <span className="rounded-full bg-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Admin</span>
        </div>
        {nav}
      </aside>
      <div className="min-w-0 px-4 py-6 md:px-8 md:py-8">{children}</div>
    </div>
  );
}

export function AdminCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-card bg-white p-4 shadow-card md:p-6"><h2 className="text-xl font-bold text-navy">{title}</h2><div className="mt-4">{children}</div></section>;
}
