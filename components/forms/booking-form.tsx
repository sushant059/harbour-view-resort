"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BedDouble, Check, Minus, Plus, Users } from "lucide-react";
import { availabilityAction, checkPromoAction, submitBooking } from "@/lib/actions";
import { TIME_WINDOWS, addDaysIso, nightsBetween, timeWindowLabel } from "@/lib/constants";
import { money } from "@/lib/invoice";
import { serviceStock } from "@/lib/stock";
import { bookingSchema, type BookingInput } from "@/lib/validators";
import { Photo } from "@/components/photo";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/fields";
import type { BlockedDate, Service, Settings } from "@/lib/types";
import { cn, darwinISODate, formatDisplayDate, waLink } from "@/lib/utils";

const STEPS = ["Dates & room", "Extras", "Your details", "Review"];
type Availability = { key: string; closed: string[]; rooms: { slug: string; left: number; total: number }[] };
type Extra = "breakfast" | "transfer" | "lateCheckout";

const EXTRAS: [Extra, string, string][] = [
  ["breakfast", "Daily breakfast", "Waterfront breakfast for every guest, each morning."],
  ["transfer", "Airport transfer", "A private car from Darwin Airport (about 15 minutes)."],
  ["lateCheckout", "Late check-out", "Stay until 2pm on your last day, when available."],
];

export function BookingForm({ services, settings, initialService = "", initial = {} }: { services: Service[]; areas?: string[]; blocked?: BlockedDate[]; settings: Settings; initialService?: string; initial?: { checkIn?: string; checkOut?: string; adults?: number; children?: number } }) {
  const today = darwinISODate();
  const rooms = services.filter((service) => service.visible && service.rooms > 0);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [promoStatus, setPromoStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [confirmedPromo, setConfirmedPromo] = useState("");
  const form = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      room: rooms.some((room) => room.slug === initialService) ? initialService : "",
      checkIn: initial.checkIn && initial.checkIn >= today ? initial.checkIn : addDaysIso(today, 7),
      checkOut: initial.checkIn && initial.checkOut && initial.checkOut > initial.checkIn && initial.checkIn >= today ? initial.checkOut : addDaysIso(today, 9),
      adults: initial.adults && initial.adults > 0 ? Math.min(10, initial.adults) : 2,
      children: initial.children ? Math.min(10, initial.children) : 0,
      breakfast: false,
      transfer: false,
      lateCheckout: false,
      arrival: "",
      from: "",
      name: "",
      phone: "",
      email: "",
      notes: "",
      promo: "",
      company_website: "",
    },
  });
  const values = form.watch();
  const nights = nightsBetween(values.checkIn, values.checkOut);
  const key = `${values.checkIn}|${values.checkOut}`;
  const selected = rooms.find((room) => room.slug === values.room);
  const guests = values.adults + values.children;

  // Live availability for every room type whenever the dates change.
  useEffect(() => {
    if (!values.checkIn || !values.checkOut || values.checkOut <= values.checkIn) return setAvailability(null);
    let cancelled = false;
    availabilityAction(values.checkIn, values.checkOut).then((result) => {
      if (!cancelled) setAvailability({ key, ...result });
    });
    return () => {
      cancelled = true;
    };
  }, [values.checkIn, values.checkOut, key]);

  const left = useMemo(() => {
    const map = new Map<string, number>();
    if (availability?.key === key) availability.rooms.forEach((room) => map.set(room.slug, room.left));
    return map;
  }, [availability, key]);

  function setCheckIn(value: string) {
    form.setValue("checkIn", value);
    // Keep the stay length when the guest moves the check-in date.
    if (!values.checkOut || values.checkOut <= value) form.setValue("checkOut", addDaysIso(value, Math.max(1, nights || 2)));
  }

  async function checkPromo() {
    const code = form.getValues("promo").trim();
    if (!code) return setPromoStatus(null);
    setCheckingPromo(true);
    const result = await checkPromoAction(code);
    setCheckingPromo(false);
    setPromoStatus({ ok: result.ok, message: result.message });
  }

  function continueStep() {
    setError("");
    if (step === 0) {
      if (!values.checkIn || values.checkIn < today) return setError("Choose a check-in date from today.");
      if (nights < 1) return setError("Check-out must be after check-in.");
      if (nights > 30) return setError("For stays longer than 30 nights, please call us.");
      if (!selected) return setError("Choose a room.");
      if (left.get(selected.slug) === 0) return setError(`The ${selected.title} is sold out for those dates. Choose another room or dates.`);
      if (guests > selected.maxGuests) return setError(`The ${selected.title} sleeps up to ${selected.maxGuests}. Choose a larger room.`);
    }
    if (step === 2) {
      form.trigger(["name", "phone", "email"]).then(async (valid) => {
        if (!valid) return;
        if (form.getValues("promo").trim() && !promoStatus) await checkPromo();
        setStep(3);
      });
      return;
    }
    setStep((current) => Math.min(3, current + 1));
  }

  async function onSubmit(data: BookingInput) {
    const result = await submitBooking(data);
    if (!result.ok) {
      setError(result.error);
      if (result.fields?.room) setStep(0);
      return;
    }
    setConfirmedPromo(result.message || "");
    setReference(result.reference || "");
  }

  if (reference) {
    return (
      <div className="rounded-card bg-white p-6 shadow-card md:p-8" role="status">
        <p className="eyebrow">Request received</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-navy">Thank you, {values.name.split(" ")[0]}.</h2>
        <p className="mt-3">Your reference is <strong>{reference}</strong>. We’re holding the {selected?.title} for {formatDisplayDate(values.checkIn)} to {formatDisplayDate(values.checkOut)} while our reservations team confirms it with you.</p>
        {confirmedPromo && <p className="mt-3 rounded-2xl bg-leaf-soft p-3 font-semibold text-leaf-dark">✅ Promo code noted: {confirmedPromo}</p>}
        <p className="mt-3 text-slate">Nothing has been charged. We’ll call or email shortly to confirm and send payment details.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a className="inline-flex min-h-12 items-center justify-center rounded-full bg-whatsapp px-6 font-semibold text-white" href={waLink(settings.phoneTel, `Hi ${settings.shortName}, my booking reference is ${reference}.`)}>WhatsApp us</a>
          <a className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-navy/15 px-6 font-semibold text-navy" href={`tel:${settings.phoneTel}`}>Call {settings.phoneDisplay}</a>
        </div>
      </div>
    );
  }

  return (
    <form className="rounded-card bg-white p-4 shadow-card sm:p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {/* Phones: "Step 1 of 4" with a thin progress bar. Larger screens: all four steps as pills. */}
      <div className="mb-6 sm:hidden" aria-hidden>
        <p className="flex items-baseline justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span className="font-display text-lg normal-case tracking-normal text-navy">{STEPS[step]}</span>
        </p>
        <div className="mt-2 grid grid-cols-4 gap-1">
          {STEPS.map((label, index) => <span key={label} className={cn("h-1 rounded-full", index <= step ? "bg-navy" : "bg-line")} />)}
        </div>
      </div>
      <ol className="mb-6 hidden grid-cols-4 gap-1.5 sm:grid" aria-label="Booking progress">
        {STEPS.map((label, index) => (
          <li key={label} aria-current={index === step ? "step" : undefined} className={cn("rounded-full px-2 py-1.5 text-center text-sm font-semibold", index === step ? "bg-navy text-white" : index < step ? "bg-sun text-navy" : "bg-mist text-slate")}>
            {index + 1}. {label}
          </li>
        ))}
      </ol>
      <div className="h-0 overflow-hidden" aria-hidden>
        <label htmlFor="booking-company">Company website</label>
        <input id="booking-company" tabIndex={-1} autoComplete="off" {...form.register("company_website")} />
      </div>

      {step === 0 && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><Label htmlFor="check-in">Check-in</Label><Input id="check-in" type="date" min={today} value={values.checkIn} onChange={(event) => setCheckIn(event.target.value)} /></div>
            <div><Label htmlFor="check-out">Check-out</Label><Input id="check-out" type="date" min={values.checkIn ? addDaysIso(values.checkIn, 1) : today} value={values.checkOut} onChange={(event) => form.setValue("checkOut", event.target.value)} /></div>
            <Counter label="Adults" value={values.adults} min={1} max={10} onChange={(value) => form.setValue("adults", value)} />
            <Counter label="Children (under 12)" value={values.children} min={0} max={10} onChange={(value) => form.setValue("children", value)} />
          </div>
          <p className="text-sm font-semibold text-navy">
            {nights > 0 ? `${nights} night${nights === 1 ? "" : "s"} · ${guests} guest${guests === 1 ? "" : "s"}` : "Choose your dates"}
            {availability?.key === key && availability.closed.length > 0 && <span className="ml-2 text-danger">The resort is closed on {availability.closed.map(formatDisplayDate).join(", ")}.</span>}
          </p>
          <fieldset>
            <legend className="mb-3 font-display text-xl font-bold text-navy">Choose your room</legend>
            <div className="grid gap-3 md:grid-cols-2">
              {rooms.map((room) => {
                const remaining = left.get(room.slug);
                const soldOut = remaining === 0;
                const tooSmall = guests > room.maxGuests;
                const active = values.room === room.slug;
                return (
                  <button
                    type="button"
                    key={room.slug}
                    disabled={soldOut}
                    aria-pressed={active}
                    onClick={() => form.setValue("room", room.slug)}
                    className={cn("group flex min-w-0 overflow-hidden rounded-2xl border-2 text-left transition", active ? "border-navy shadow-card" : "border-line hover:border-navy/30", soldOut && "cursor-not-allowed opacity-55")}
                  >
                    <span className="relative w-28 shrink-0 bg-mist sm:w-36"><Photo src={room.image} stock={serviceStock(room.slug)} fill sizes="150px" /></span>
                    <span className="min-w-0 flex-1 p-3 sm:p-4">
                      <span className="flex items-start justify-between gap-2">
                        <span className="font-display text-lg font-bold leading-tight text-navy">{room.title}</span>
                        {active && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy text-white"><Check className="h-4 w-4" aria-hidden /></span>}
                      </span>
                      <span className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate">
                        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" aria-hidden /> Sleeps {room.maxGuests}</span>
                        <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" aria-hidden /> {room.category === "rooms" ? "Room" : "Suite / villa"}</span>
                      </span>
                      <span className="mt-2 block font-semibold text-navy">
                        {room.nightlyRate ? <>{money(room.nightlyRate)} <span className="text-sm font-normal text-slate">/ night</span>{nights > 0 && <span className="block text-sm font-normal text-slate">{money(room.nightlyRate * nights)} for {nights} night{nights === 1 ? "" : "s"}</span>}</> : "Rate on request"}
                      </span>
                      <span className={cn("mt-1 block text-xs font-bold", soldOut ? "text-danger" : remaining !== undefined && remaining <= 2 ? "text-[#9A5B00]" : "text-leaf-dark")}>
                        {remaining === undefined ? "Checking availability…" : soldOut ? "Sold out for these dates" : remaining <= 2 ? `Only ${remaining} left` : "Available"}
                        {!soldOut && tooSmall && <span className="ml-1 text-danger">· too small for {guests}</span>}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-navy">Make it yours</h2>
          {EXTRAS.map(([field, title, text]) => (
            <label key={field} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4", values[field] ? "border-navy bg-mist" : "border-line")}>
              <input type="checkbox" className="mt-1 h-5 w-5" checked={values[field]} onChange={(event) => form.setValue(field, event.target.checked)} />
              <span><span className="block font-semibold text-navy">{title}</span><span className="text-sm text-slate">{text}</span></span>
            </label>
          ))}
          <div>
            <p className="mb-2 text-sm font-semibold text-navy">Arrival time (optional)</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {TIME_WINDOWS.map((window) => (
                <button type="button" key={window.id} aria-pressed={values.arrival === window.id} onClick={() => form.setValue("arrival", values.arrival === window.id ? "" : window.id)} className={cn("min-h-12 rounded-full px-4 text-sm font-semibold", values.arrival === window.id ? "bg-navy text-white" : "bg-mist text-navy")}>{window.label}</button>
              ))}
            </div>
          </div>
          <div><Label htmlFor="booking-notes">Special requests (optional)</Label><Textarea id="booking-notes" placeholder="Celebrating something? Dietary needs, accessible room, cot…" {...form.register("notes")} /></div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="booking-name">Full name</Label><Input id="booking-name" autoComplete="name" {...form.register("name")} /><FieldError message={form.formState.errors.name?.message} /></div>
          <div><Label htmlFor="booking-phone">Mobile</Label><Input id="booking-phone" autoComplete="tel" inputMode="tel" {...form.register("phone")} /><FieldError message={form.formState.errors.phone?.message} /></div>
          <div><Label htmlFor="booking-email">Email</Label><Input id="booking-email" type="email" autoComplete="email" {...form.register("email")} /><FieldError message={form.formState.errors.email?.message} /></div>
          <div><Label htmlFor="booking-from">Travelling from (optional)</Label><Input id="booking-from" placeholder="e.g. Sydney, Singapore" {...form.register("from")} /></div>
          <div className="sm:col-span-2">
            <Label htmlFor="booking-promo">Promo code (optional)</Label>
            <div className="flex gap-2">
              <Input id="booking-promo" autoComplete="off" className="uppercase" {...form.register("promo", { onChange: () => setPromoStatus(null) })} />
              <Button type="button" variant="outline" size="sm" className="shrink-0" disabled={checkingPromo} onClick={checkPromo}>{checkingPromo ? "Checking…" : "Check"}</Button>
            </div>
            {promoStatus?.message && <p className={cn("mt-2 text-sm font-semibold", promoStatus.ok ? "text-leaf-dark" : "text-danger")} role="status">{promoStatus.ok ? "✅ " : ""}{promoStatus.message}</p>}
          </div>
        </div>
      )}

      {step === 3 && selected && (
        <div className="grid gap-5 md:grid-cols-[220px_1fr]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mist md:aspect-auto"><Photo src={selected.image} stock={serviceStock(selected.slug)} fill sizes="220px" /></div>
          <dl className="space-y-2 text-[15px]">
            <Row label="Room" value={selected.title} />
            <Row label="Dates" value={`${formatDisplayDate(values.checkIn)} → ${formatDisplayDate(values.checkOut)} (${nights} night${nights === 1 ? "" : "s"})`} />
            <Row label="Guests" value={`${values.adults} adult${values.adults === 1 ? "" : "s"}${values.children ? `, ${values.children} child${values.children === 1 ? "" : "ren"}` : ""}`} />
            <Row label="Extras" value={[values.breakfast && "Breakfast", values.transfer && "Airport transfer", values.lateCheckout && "Late check-out", values.arrival && `Arriving ${timeWindowLabel(values.arrival)}`].filter(Boolean).join(", ") || "None"} />
            <Row label="Guest" value={`${values.name} · ${values.phone} · ${values.email}`} />
            {values.notes && <Row label="Requests" value={values.notes} />}
            {values.promo.trim() && <Row label="Promo" value={`${values.promo.trim().toUpperCase()}${promoStatus ? ` (${promoStatus.ok ? promoStatus.message : `${promoStatus.message} It won’t be applied.`})` : ""}`} />}
            {selected.nightlyRate > 0 && <div className="flex justify-between border-t-2 border-navy pt-3 font-display text-xl font-semibold text-navy"><dt>Room total</dt><dd>{money(selected.nightlyRate * nights)}</dd></div>}
            <p className="text-sm text-slate">Extras are priced when we confirm. Sending this request doesn’t charge you.</p>
          </dl>
        </div>
      )}

      {error && <p className="mt-4 text-sm font-medium text-danger" role="alert">{error}</p>}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {step > 0 && <Button type="button" variant="ghost" onClick={() => { setError(""); setStep((current) => current - 1); }}>Back</Button>}
        {step < 3 && <Button type="button" variant="navy" onClick={continueStep}>Continue</Button>}
        {step === 3 && <Button type="submit" variant="navy" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Sending…" : "Request this booking"}</Button>}
        {step === 0 && selected && nights > 0 && selected.nightlyRate > 0 && <span className="text-sm text-slate">{selected.title} · {money(selected.nightlyRate * nights)}</span>}
      </div>
    </form>
  );
}

function Counter({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-navy">{label}</p>
      <div className="flex min-h-12 items-center justify-between rounded-input border border-line px-2">
        <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-mist" aria-label={`Fewer ${label.toLowerCase()}`} onClick={() => onChange(Math.max(min, value - 1))}><Minus className="h-4 w-4" aria-hidden /></button>
        <strong className="text-lg">{value}</strong>
        <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-mist" aria-label={`More ${label.toLowerCase()}`} onClick={() => onChange(Math.min(max, value + 1))}><Plus className="h-4 w-4" aria-hidden /></button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-3 border-b border-line pb-2">
      <dt className="font-semibold text-slate">{label}</dt>
      <dd className="min-w-0 break-words text-navy">{value}</dd>
    </div>
  );
}
