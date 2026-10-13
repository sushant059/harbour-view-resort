"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** The hero's quick search: dates and guests, straight into the booking form. */
export function HeroSearch({ today, tomorrow, later }: { today: string; tomorrow: string; later: string }) {
  const [checkIn, setCheckIn] = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(later);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const href = `/booking?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`;
  const nights = Math.max(0, Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000));
  const field = "mt-1 w-full bg-transparent font-display text-xl text-white [color-scheme:dark] focus:outline-none md:text-2xl";
  const cell = "group relative flex flex-col rounded-[18px] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55 transition hover:bg-white/[0.07] focus-within:bg-white/[0.09]";
  return (
    <form className="grid grid-cols-2 gap-1 rounded-[26px] border border-white/15 bg-navy-deep/40 p-2 backdrop-blur-xl lg:grid-cols-[1.2fr_1.2fr_.8fr_.8fr_auto] lg:items-stretch" onSubmit={(event) => { event.preventDefault(); window.location.href = href; }}>
      <label className={cell}>Arrive
        <input type="date" min={today} value={checkIn} onChange={(event) => { setCheckIn(event.target.value); if (checkOut <= event.target.value) setCheckOut(addDays(event.target.value, 1)); }} className={cn(field, "normal-case tracking-normal")} />
      </label>
      <label className={cell}>Depart{nights > 0 && <span className="absolute right-4 top-3 text-sky normal-case tracking-normal">{nights} night{nights === 1 ? "" : "s"}</span>}
        <input type="date" min={addDays(checkIn, 1)} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className={cn(field, "normal-case tracking-normal")} />
      </label>
      <label className={cell}>Adults
        <select value={adults} onChange={(event) => setAdults(Number(event.target.value))} className={cn(field, "normal-case tracking-normal [&>option]:text-ink")}>
          {[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label className={cell}>Children
        <select value={children} onChange={(event) => setChildren(Number(event.target.value))} className={cn(field, "normal-case tracking-normal [&>option]:text-ink")}>
          {[0, 1, 2, 3, 4].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <button type="submit" data-cursor="Search" className="group col-span-2 inline-flex min-h-14 items-center justify-center gap-3 rounded-[18px] bg-sky px-7 font-semibold text-navy-deep transition hover:bg-white lg:col-span-1">
        Check availability <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
      </button>
    </form>
  );
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
