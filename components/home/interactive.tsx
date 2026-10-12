"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, MapPin, Search } from "lucide-react";
import { Photo } from "@/components/photo";
import { serviceStock } from "@/lib/stock";
import { VideoPlayer } from "@/components/video";
import { matchSuburb } from "@/lib/validators";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SuburbChecker({ areas }: { areas: string[] }) {
  const [value, setValue] = useState("");
  const result = useMemo(() => matchSuburb(value, areas), [value, areas]);
  return (
    <form className="card p-6 md:p-8" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="suburb-check" className="font-display text-2xl font-bold text-navy">Do we come to you?</label>
      <p className="mt-1 text-slate">Type your suburb to check.</p>
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate" aria-hidden />
        <input id="suburb-check" value={value} onChange={(event) => setValue(event.target.value)} placeholder="e.g. Parap, Palmerston, Howard Springs" autoComplete="address-level2" className="min-h-14 w-full rounded-full border border-line bg-mist pl-12 pr-4 text-lg focus:border-brand focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky/20" />
      </div>
      <div className="mt-4 min-h-12" aria-live="polite">
        {value.trim() && result.match && (
          <p className="flex items-center gap-3 rounded-2xl bg-leaf-soft p-3 font-semibold text-leaf-dark"><span className="grid h-8 w-8 place-items-center rounded-full bg-leaf-dark text-white"><Check className="h-4 w-4" aria-hidden /></span> Yes! We clean in {result.match}. <Link href="/free-quote" className="ml-auto underline">Get a quote</Link></p>
        )}
        {value.trim() && !result.match && result.suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm"><span className="text-slate">Did you mean</span>{result.suggestions.map((item) => <button key={item} type="button" className="chip bg-brand-light text-brand" onClick={() => setValue(item)}>{item}</button>)}</div>
        )}
        {value.trim() && !result.match && result.suggestions.length === 0 && <p className="rounded-2xl bg-sun-soft p-3 text-sm text-[#7A4E00]">Not on our list yet, but ask anyway. Send a quote and we’ll tell you straight away if we can reach you.</p>}
        {!value.trim() && <p className="flex items-center gap-2 text-sm text-slate"><MapPin className="h-4 w-4 text-leaf-dark" aria-hidden /> {areas.length}+ suburbs across Darwin, Palmerston and the rural area.</p>}
      </div>
    </form>
  );
}

export function VideoShowcase({ services }: { services: Service[] }) {
  const items = services.filter((service) => service.visible);
  const [active, setActive] = useState(items[0]?.slug);
  const current = items.find((service) => service.slug === active) ?? items[0];
  if (!current) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0" role="tablist" aria-label="Service videos">
        {items.map((service) => (
          <button
            key={service.slug}
            type="button"
            role="tab"
            aria-selected={service.slug === current.slug}
            onClick={() => setActive(service.slug)}
            className={cn("flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left font-semibold transition", service.slug === current.slug ? "bg-white text-navy shadow-card" : "text-white/75 hover:bg-white/10 hover:text-white")}
          >
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/10"><Photo src={service.image} stock={serviceStock(service.slug)} fill sizes="40px" /></span>
            {service.title}
            {service.videoUrl && <span className="ml-auto hidden h-2 w-2 rounded-full bg-leaf lg:block" aria-label="Video available" />}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="self-start overflow-hidden rounded-card bg-navy-deep shadow-soft ring-1 ring-white/10">
        <VideoPlayer key={current.slug} url={current.videoUrl} poster={current.image} title={`${current.title} at Harbour View Resort`} scene={current.slug} />
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="font-display text-xl font-bold text-white">{current.title}</p>
            <p className="text-sm text-white/65">{current.summary}</p>
          </div>
          <Link href={`/services/${current.slug}`} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20">Details <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
      </div>
    </div>
  );
}

/** The hero's quick search: dates and guests, straight into the booking form. */
export function HeroSearch({ today, tomorrow, later }: { today: string; tomorrow: string; later: string }) {
  const [checkIn, setCheckIn] = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(later);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const href = `/booking?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`;
  const field = "min-h-12 w-full rounded-xl border border-white/25 bg-white/10 px-3 text-[15px] text-white [color-scheme:dark] focus:border-sky focus:outline-none";
  return (
    <form className="grid gap-3 rounded-[24px] bg-navy-deep/55 p-4 ring-1 ring-white/20 backdrop-blur-md sm:grid-cols-2 lg:grid-cols-[1fr_1fr_.7fr_.7fr_auto] lg:items-end" onSubmit={(event) => { event.preventDefault(); window.location.href = href; }}>
      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Check-in
        <input type="date" min={today} value={checkIn} onChange={(event) => { setCheckIn(event.target.value); if (checkOut <= event.target.value) setCheckOut(event.target.value); }} className={cn(field, "mt-1.5 normal-case tracking-normal")} />
      </label>
      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Check-out
        <input type="date" min={checkIn} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className={cn(field, "mt-1.5 normal-case tracking-normal")} />
      </label>
      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Adults
        <select value={adults} onChange={(event) => setAdults(Number(event.target.value))} className={cn(field, "mt-1.5 normal-case tracking-normal [&>option]:text-ink")}>
          {[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Children
        <select value={children} onChange={(event) => setChildren(Number(event.target.value))} className={cn(field, "mt-1.5 normal-case tracking-normal [&>option]:text-ink")}>
          {[0, 1, 2, 3, 4].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <button type="submit" className="min-h-12 rounded-xl bg-leaf px-6 font-semibold text-navy-deep transition hover:bg-sun sm:col-span-2 lg:col-span-1">Check availability</button>
    </form>
  );
}
