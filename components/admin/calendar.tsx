"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarX2, ChevronLeft, ChevronRight, LogIn, LogOut, Plus } from "lucide-react";
import { deleteBlockedDateAction, saveBlockedDateAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toaster";
import { JOB_STATUSES, addDaysIso } from "@/lib/constants";
import type { StayItem } from "@/lib/schedule";
import type { BlockedDate } from "@/lib/types";
import { cn, formatDisplayDate } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
type RoomType = { slug: string; title: string; total: number };

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function tone(item: StayItem) {
  if (item.kind === "booking") return "bg-sky-soft text-navy";
  return JOB_STATUSES.find((status) => status.id === item.status)?.tone ?? "bg-mist text-navy";
}

function label(item: StayItem) {
  if (item.kind === "booking") return "Booking request";
  return JOB_STATUSES.find((status) => status.id === item.status)?.label ?? item.status;
}

/** Stays in the house on a night (check-in on or before it, check-out after it). */
const inHouse = (items: StayItem[], night: string) => items.filter((item) => item.checkIn <= night && item.checkOut > night);

export function CalendarBoard({ items, blocked, rooms, today }: { items: StayItem[]; blocked: BlockedDate[]; rooms: RoomType[]; today: string }) {
  const [cursor, setCursor] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }));
  const [selected, setSelected] = useState(today);
  const totalRooms = rooms.reduce((sum, room) => sum + room.total, 0);
  const blockedByDate = useMemo(() => new Map(blocked.map((item) => [item.date, item])), [blocked]);

  const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
  const daysInMonth = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7; // Monday first
  const cells: (string | null)[] = [...Array(leading).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => iso(cursor.year, cursor.month, i + 1))];
  while (cells.length % 7) cells.push(null);
  const monthName = first.toLocaleString("en-AU", { month: "long", year: "numeric", timeZone: "UTC" });
  const move = (delta: number) => setCursor(({ year, month }) => {
    const next = new Date(Date.UTC(year, month + delta, 1));
    return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
  });
  const arrivals = items.filter((item) => item.checkIn >= today).slice(0, 12);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
      <section className="rounded-card bg-white p-3 shadow-card sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="mr-auto text-2xl font-bold text-navy">{monthName}</h2>
          <Button type="button" size="sm" variant="ghost" onClick={() => { setCursor({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }); setSelected(today); }}>Today</Button>
          <Button type="button" size="icon" variant="outline" aria-label="Previous month" onClick={() => move(-1)}><ChevronLeft className="h-5 w-5" aria-hidden /></Button>
          <Button type="button" size="icon" variant="outline" aria-label="Next month" onClick={() => move(1)}><ChevronRight className="h-5 w-5" aria-hidden /></Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-wider text-slate">
          {WEEKDAYS.map((day) => <div key={day} className="py-1">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="min-h-16 rounded-xl md:min-h-24" />;
            const night = inHouse(items, date);
            const used = night.length;
            const share = totalRooms ? used / totalRooms : 0;
            const isBlocked = blockedByDate.has(date);
            const arriving = items.filter((item) => item.checkIn === date).length;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelected(date)}
                className={cn(
                  "relative flex min-h-16 flex-col overflow-hidden rounded-xl border p-1.5 text-left transition md:min-h-24",
                  selected === date ? "border-navy ring-2 ring-navy/20" : "border-line hover:border-brand",
                  isBlocked && "bg-[repeating-linear-gradient(135deg,#F3F7FC_0,#F3F7FC_6px,#fff_6px,#fff_12px)]",
                  date < today && "opacity-60",
                )}
                aria-label={`${formatDisplayDate(date)}: ${used} of ${totalRooms} rooms booked${isBlocked ? ", closed" : ""}`}
              >
                <span className={cn("grid h-6 w-6 place-items-center rounded-full text-xs font-bold", date === today ? "bg-navy text-white" : "text-navy")}>{Number(date.slice(8))}</span>
                {!isBlocked && totalRooms > 0 && (
                  <>
                    <span className="mt-auto text-[11px] font-bold text-navy md:text-xs">{used}/{totalRooms}<span className="hidden md:inline"> rooms</span></span>
                    {arriving > 0 && <span className="hidden text-[11px] text-slate md:block">{arriving} arriving</span>}
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-mist" aria-hidden><span className={cn("block h-full", share >= 1 ? "bg-danger" : share >= 0.7 ? "bg-sun" : "bg-leaf")} style={{ width: `${Math.min(100, share * 100)}%` }} /></span>
                  </>
                )}
                {isBlocked && <span className="mt-auto text-[10px] font-bold uppercase text-danger">Closed</span>}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-slate">Each day shows rooms booked that night out of {totalRooms}. Green is quiet, amber is busy, red is full. Includes booking requests not yet confirmed.</p>
      </section>

      <div className="space-y-6">
        <DayPanel date={selected} items={items} rooms={rooms} blocked={blockedByDate.get(selected)} today={today} />
        <section className="rounded-card bg-white p-5 shadow-card">
          <h2 className="text-lg font-bold text-navy">Upcoming arrivals</h2>
          {arrivals.length === 0 && <p className="mt-2 text-sm text-slate">No upcoming stays yet.</p>}
          <ul className="mt-2 divide-y divide-line">
            {arrivals.map((item) => (
              <li key={item.id} className="py-2">
                <Link href={item.href} className="block hover:text-brand">
                  <span className="text-sm font-semibold text-navy">{formatDisplayDate(item.checkIn)} → {formatDisplayDate(item.checkOut)}</span>
                  <span className="block truncate text-sm text-slate">{item.name} · {item.roomTitle}{item.guests ? ` · ${item.guests} guests` : ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function DayPanel({ date, items, rooms, blocked, today }: { date: string; items: StayItem[]; rooms: RoomType[]; blocked?: BlockedDate; today: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [reason, setReason] = useState("");
  const night = inHouse(items, date);
  const checkingIn = items.filter((item) => item.checkIn === date);
  const checkingOut = items.filter((item) => item.checkOut === date);
  return (
    <section className="rounded-card bg-white p-5 shadow-card">
      <p className="text-sm font-semibold text-slate">{date === today ? "Today" : "Selected night"}</p>
      <h2 className="text-xl font-bold text-navy">{new Date(`${date}T00:00:00Z`).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })}</h2>
      {blocked && <p className="mt-2 flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-danger"><CalendarX2 className="h-4 w-4" aria-hidden /> Closed{blocked.reason ? `: ${blocked.reason}` : ""}. Guests can’t book this night.</p>}
      <ul className="mt-4 space-y-2">
        {rooms.map((room) => {
          const used = night.filter((item) => item.room === room.slug);
          const free = Math.max(0, room.total - used.length);
          return (
            <li key={room.slug} className="rounded-2xl border border-line p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-navy">{room.title}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", free ? "bg-leaf-soft text-leaf-dark" : "bg-red-50 text-danger")}>{free ? `${free} of ${room.total} free` : "Full"}</span>
              </div>
              {used.map((item) => <StayRow key={item.id} item={item} />)}
            </li>
          );
        })}
      </ul>
      {(checkingIn.length > 0 || checkingOut.length > 0) && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <p className="flex items-center gap-2 rounded-2xl bg-mist p-3 text-sm"><LogIn className="h-4 w-4 text-leaf-dark" aria-hidden /> {checkingIn.length} arriving</p>
          <p className="flex items-center gap-2 rounded-2xl bg-mist p-3 text-sm"><LogOut className="h-4 w-4 text-slate" aria-hidden /> {checkingOut.length} leaving</p>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm"><Link href="/admin/customers"><Plus className="h-4 w-4" aria-hidden /> Add a stay</Link></Button>
        {blocked ? (
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => start(async () => {
            const result = await deleteBlockedDateAction(blocked.id);
            toast(result.ok ? "Night reopened" : result.error, result.ok ? "ok" : "error");
            router.refresh();
          })}>Reopen night</Button>
        ) : (
          <form className="flex flex-1 gap-2" onSubmit={(event) => {
            event.preventDefault();
            start(async () => {
              const result = await saveBlockedDateAction(date, reason);
              toast(result.ok ? "Night closed. Guests can’t book it." : result.error, result.ok ? "ok" : "error");
              if (result.ok) setReason("");
              router.refresh();
            });
          }}>
            <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason (e.g. buyout)" aria-label="Reason for closing" className="min-h-10" />
            <Button type="submit" size="sm" variant="outline" disabled={pending} className="shrink-0">Close night</Button>
          </form>
        )}
      </div>
      <p className="mt-3 text-xs text-slate">Next night: {formatDisplayDate(addDaysIso(date, 1))}</p>
    </section>
  );
}

function StayRow({ item }: { item: StayItem }) {
  return (
    <Link href={item.href} className="mt-2 block rounded-xl bg-mist p-2 hover:ring-2 hover:ring-brand/30">
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-navy">{item.name || "—"}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", tone(item))}>{label(item)}</span>
      </span>
      <span className="block truncate text-xs text-slate">{item.reference} · {formatDisplayDate(item.checkIn)} → {formatDisplayDate(item.checkOut)}{item.guests ? ` · ${item.guests} guests` : ""}</span>
    </Link>
  );
}
