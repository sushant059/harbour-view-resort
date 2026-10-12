"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, MapPin, Phone, RotateCcw, Send, X } from "lucide-react";
import { botReplyAction, checkPromoAction, submitChat } from "@/lib/actions";
import { CHAT_OPTIONS, PREFERRED_TIMES, SERVICE_FIELDS, SERVICE_TITLES, addDaysIso, fieldQuestion, summariseJob, validateDetails, type Field } from "@/lib/constants";
import { ServiceIcon } from "@/components/icons";
import { BrandIcon, whatsappHref } from "@/components/social";
import type { Service, Settings } from "@/lib/types";
import { normalizeAuPhone } from "@/lib/validators";
import { cn, darwinISODate, formatDisplayDate } from "@/lib/utils";

type Detail = string | number | boolean;
type Message = { id: number; from: "bot" | "user"; text: string };

type Draft = {
  services: string[];
  servicesDone: boolean;
  details: Record<string, Detail>;
  suburb: string;
  name: string;
  phone: string;
  time: string;
  promo: string;
  promoAsked: boolean;
  reference: string;
  promoMessage: string;
};

type Ask =
  | { id: "services" }
  | { id: "field"; service: string; field: Field }
  | { id: "suburb" | "name" | "phone" | "time" | "promo" | "confirm" | "done" };

const EMPTY: Draft = { services: [], servicesDone: false, details: {}, suburb: "", name: "", phone: "", time: "", promo: "", promoAsked: false, reference: "", promoMessage: "" };
const STORAGE = "hvr-chat-v1";
const GREETING = "Welcome to Harbour View Resort 🌅 I’m the reservations assistant. Tell me what you’d like to book and our team will confirm everything with you personally.";

/** Works out the next question from what has been answered so far. */
function nextAsk(draft: Draft): Ask {
  if (!draft.servicesDone) return { id: "services" };
  for (const service of draft.services) {
    for (const field of SERVICE_FIELDS[service] ?? []) {
      if (draft.details[field.key] === undefined) return { id: "field", service, field };
    }
  }
  if (!draft.suburb) return { id: "suburb" };
  if (!draft.name) return { id: "name" };
  if (!draft.phone) return { id: "phone" };
  if (!draft.time) return { id: "time" };
  if (!draft.promoAsked) return { id: "promo" };
  if (!draft.reference) return { id: "confirm" };
  return { id: "done" };
}

function askText(ask: Ask, draft: Draft) {
  switch (ask.id) {
    case "services":
      return draft.services.length ? "Anything else to add? Tap more, or press Continue." : "What can we book for you? Choose a room, a table, the spa or anything else. You can pick more than one.";
    case "field": {
      const first = (SERVICE_FIELDS[ask.service] ?? [])[0]?.key === ask.field.key && draft.services.length > 1;
      return `${first ? `Now for ${SERVICE_TITLES[ask.service]?.toLowerCase()}. ` : ""}${fieldQuestion(ask.field)}`;
    }
    case "suburb":
      return "Where will you be travelling from?";
    case "name":
      return "Lovely. What’s your name?";
    case "phone":
      return `Thanks ${draft.name.split(" ")[0]}! What’s the best mobile number to reach you on?`;
    case "time":
      return "When is the best time for our team to contact you?";
    case "promo":
      return "Do you have a promo code?";
    case "confirm":
      return "Here’s your request. Does everything look right?";
    default:
      return "";
  }
}

export function ChatWidget({ settings, services, open, onOpenChange }: { settings: Settings; services: Pick<Service, "slug" | "title" | "icon" | "category">[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const counter = useRef(0);

  const ask = useMemo(() => nextAsk(draft), [draft]);
  const options = useMemo(() => {
    const visible = new Set(services.map((service) => service.slug));
    return CHAT_OPTIONS.filter((option) => visible.has(option.slug) || option.slug === "something-else");
  }, [services]);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE);
      if (saved) {
        const parsed = JSON.parse(saved) as { draft: Draft; messages: Message[] };
        setDraft({ ...EMPTY, ...parsed.draft });
        setMessages(parsed.messages || []);
        counter.current = parsed.messages?.length || 0;
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.sessionStorage.setItem(STORAGE, JSON.stringify({ draft, messages }));
    } catch {}
  }, [draft, messages, ready]);

  // Ask the next question whenever the draft moves on.
  useEffect(() => {
    if (!ready || !open) return;
    if (messages.length === 0) {
      push("bot", GREETING);
    }
    const text = askText(ask, draft);
    if (!text) return;
    const last = [...messages].reverse().find((message) => message.from === "bot");
    if (last?.text === text) return;
    setTyping(true);
    const timer = window.setTimeout(() => {
      setTyping(false);
      push("bot", text);
    }, 450);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask, ready, open, epoch]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, ask]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open && wantsText(ask)) window.setTimeout(() => inputRef.current?.focus(), 500);
  }, [open, ask]);

  function push(from: Message["from"], text: string) {
    counter.current += 1;
    const id = counter.current;
    setMessages((current) => [...current, { id, from, text }]);
  }

  function answer(label: string, patch: Partial<Draft>) {
    push("user", label);
    setDraft((current) => ({ ...current, ...patch }));
  }

  function setDetail(key: string, value: Detail, label: string) {
    push("user", label);
    setDraft((current) => {
      const details = { ...current.details, [key]: value };
      const next = { ...current, details };
      // Once every question for a service is answered, check the answers make sense.
      const service = current.services.find((slug) => (SERVICE_FIELDS[slug] ?? []).some((field) => field.key === key));
      if (service) {
        const fields = SERVICE_FIELDS[service] ?? [];
        if (fields.every((field) => details[field.key] !== undefined)) {
          const problem = validateDetails([service], details);
          if (problem) {
            window.setTimeout(() => push("bot", `${problem} Let’s try that again.`), 100);
            const reset = { ...details };
            fields.forEach((field) => delete reset[field.key]);
            return { ...next, details: reset };
          }
        }
      }
      return next;
    });
  }

  function restart() {
    setDraft(EMPTY);
    setMessages([]);
    counter.current = 0;
    setEpoch((value) => value + 1);
  }

  function pickDate(value: string) {
    if (ask.id !== "field" || ask.field.kind !== "date") return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
    if (value < darwinISODate()) return push("bot", "That date has passed. Please choose today or later.");
    setDetail(ask.field.key, value, formatDisplayDate(value));
  }

  async function submitText(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    if (ask.id === "suburb") {
      if (text.length < 2) return push("bot", "Could you type the city or country?");
      return answer(text, { suburb: text.slice(0, 80) });
    }
    if (ask.id === "name") {
      if (text.length < 2) return push("bot", "Could you tell me your name?");
      return answer(text, { name: text.slice(0, 80) });
    }
    if (ask.id === "phone") {
      const phone = normalizeAuPhone(text);
      push("user", text);
      if (!phone) return push("bot", "Hmm, that doesn’t look like a phone number. Try 0401 647 545, or include the country code like +65 9123 4567.");
      return setDraft((current) => ({ ...current, phone }));
    }
    if (ask.id === "promo") {
      push("user", text);
      const result = await checkPromoAction(text);
      if (!result.ok) {
        push("bot", `${result.message || "That code isn’t active."} You can try another, or tap “No code”.`);
        return;
      }
      push("bot", `✅ ${result.message}`);
      return setDraft((current) => ({ ...current, promo: text, promoAsked: true, promoMessage: result.message }));
    }
    if (ask.id === "field" && ask.field.kind === "text") {
      if (text.length < 3) return push("bot", "A few more words would help.");
      return setDetail(ask.field.key, text.slice(0, 300), text);
    }
    if (ask.id === "field" && ask.field.kind === "stepper") {
      const value = Number.parseInt(text, 10);
      if (Number.isFinite(value) && value >= ask.field.min && value <= ask.field.max) return setDetail(ask.field.key, value, String(value));
    }
    // Anything else is a question: answer it from the FAQs, then carry on.
    push("user", text);
    setTyping(true);
    const reply = await botReplyAction(text);
    setTyping(false);
    push("bot", reply.reply);
    const again = askText(ask, draft);
    if (again && ask.id !== "done") window.setTimeout(() => push("bot", again), 300);
  }

  async function send() {
    setBusy(true);
    const result = await submitChat({
      services: draft.services,
      details: draft.details,
      suburb: draft.suburb,
      name: draft.name,
      phone: draft.phone,
      preferredTime: draft.time,
      promo: draft.promo,
      company_website: "",
    });
    setBusy(false);
    if (!result.ok) {
      push("bot", `Sorry, something went wrong: ${result.error} You can also call us on ${settings.phoneDisplay}.`);
      return;
    }
    push("user", "Send my request");
    setDraft((current) => ({ ...current, reference: result.reference || "HVR", promoMessage: result.message || current.promoMessage }));
    push("bot", `Thank you, ${draft.name.split(" ")[0]}! 🌴 Our reservations team will contact you shortly on ${draft.phone} to confirm. Your reference is ${result.reference}.`);
  }

  if (!open) return null;
  const summary = summariseJob(draft.services, draft.details);
  const whatsappText = `Hi ${settings.shortName}, I'd like to book.\nReference: ${draft.reference}\n${summary.join("\n")}\nName: ${draft.name}`;
  const answered = [draft.servicesDone, draft.suburb, draft.name, draft.phone, draft.time, draft.promoAsked, draft.reference].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-mist md:inset-auto md:bottom-6 md:right-6 md:h-[min(720px,calc(100vh-3rem))] md:w-[420px] md:overflow-hidden md:rounded-[28px] md:shadow-soft md:ring-1 md:ring-line" role="dialog" aria-label={`${settings.shortName} reservations assistant`}>
      <header className="relative overflow-hidden bg-hero px-5 pb-4 pt-5 text-white">
        <div className="flex items-center gap-3">
          <span className="relative grid h-11 w-11 place-items-center rounded-full bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hvr-mark.png" alt="" className="h-9 w-9" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-navy bg-leaf" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold leading-tight">{settings.shortName}</p>
            <p className="text-sm text-white/70">Reservations assistant · replies instantly</p>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" aria-label="Start over" title="Start over" onClick={restart}><RotateCcw className="h-4 w-4" aria-hidden /></button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" aria-label="Close chat" onClick={() => onOpenChange(false)}><X aria-hidden /></button>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15" aria-hidden>
          <div className="h-full rounded-full bg-leaf transition-all duration-500" style={{ width: `${(answered / 7) * 100}%` }} />
        </div>
      </header>

      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-5" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex animate-rise", message.from === "user" ? "justify-end" : "justify-start")}>
            <p className={cn("max-w-[85%] whitespace-pre-line rounded-[20px] px-4 py-2.5 text-[15px] leading-snug", message.from === "user" ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-white text-ink shadow-card")}>{message.text}</p>
          </div>
        ))}
        {typing && (
          <div className="flex" aria-label="Assistant is typing">
            <span className="flex gap-1 rounded-[20px] rounded-bl-md bg-white px-4 py-3.5 shadow-card">
              {[0, 1, 2].map((dot) => <span key={dot} className="h-2 w-2 animate-bounce rounded-full bg-slate/50" style={{ animationDelay: `${dot * 120}ms` }} />)}
            </span>
          </div>
        )}

        {!typing && ask.id === "confirm" && (
          <div className="animate-rise rounded-2xl bg-white p-4 text-sm shadow-card">
            <Row label="Booking" value={summary.join("\n")} />
            <Row label="From" value={draft.suburb} />
            <Row label="Name" value={draft.name} />
            <Row label="Mobile" value={draft.phone} />
            <Row label="Contact" value={draft.time} />
            {draft.promoMessage && <Row label="Promo" value={draft.promoMessage} />}
          </div>
        )}

        {draft.reference && (
          <div className="animate-rise space-y-2 rounded-2xl bg-white p-4 shadow-card">
            <p className="text-sm text-slate">Prefer to chat with a person now?</p>
            <a className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-whatsapp font-bold text-white" href={whatsappHref(settings, whatsappText)} target="_blank" rel="noopener noreferrer"><BrandIcon name="whatsapp" className="h-5 w-5" /> Message us on WhatsApp</a>
            <a className="flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-line font-bold text-navy" href={`tel:${settings.phoneTel}`}><Phone className="h-4 w-4" aria-hidden /> Call {settings.phoneDisplay}</a>
          </div>
        )}
      </div>

      {/* Quick replies */}
      {!typing && (
        <div className="border-t border-line bg-white px-4 pt-3">
          {ask.id === "services" && (
            <div>
              <div className="no-scrollbar flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                {options.map((option) => {
                  const selected = draft.services.includes(option.slug);
                  return (
                    <button key={option.slug} type="button" aria-pressed={selected} onClick={() => setDraft((current) => ({ ...current, services: selected ? current.services.filter((slug) => slug !== option.slug) : [...current.services, option.slug] }))} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition", selected ? "border-brand bg-brand text-white" : "border-line bg-white text-navy hover:border-brand")}>
                      {selected ? <Check className="h-4 w-4" aria-hidden /> : <ServiceIcon name={option.icon} className="h-4 w-4" />} {option.label}
                    </button>
                  );
                })}
              </div>
              <button type="button" disabled={!draft.services.length} onClick={() => answer(draft.services.map((slug) => SERVICE_TITLES[slug]).join(", "), { servicesDone: true })} className="mt-3 min-h-12 w-full rounded-full bg-leaf-dark font-bold text-white transition disabled:opacity-40">
                {draft.services.length ? `Continue with ${draft.services.length} service${draft.services.length > 1 ? "s" : ""}` : "Choose a service"}
              </button>
            </div>
          )}
          {ask.id === "field" && ask.field.kind === "date" && <DateReplies onPick={pickDate} />}
          {ask.id === "field" && <FieldReplies field={ask.field} onPick={(value, label) => setDetail(ask.field.key, value, label)} />}
          {ask.id === "suburb" && (
            <div className="flex flex-wrap gap-2">
              {["Darwin", "Sydney", "Melbourne", "Brisbane", "Perth", "Overseas"].map((place) => <Chip key={place} onClick={() => answer(place, { suburb: place })}>{place}</Chip>)}
              <Chip onClick={() => locate((place) => answer(place, { suburb: place }), (message) => push("bot", message))}><MapPin className="h-4 w-4" aria-hidden /> Use my location</Chip>
            </div>
          )}
          {ask.id === "time" && <div className="flex flex-wrap gap-2">{PREFERRED_TIMES.map((time) => <Chip key={time} onClick={() => answer(time, { time })}>{time}</Chip>)}</div>}
          {ask.id === "promo" && <div className="flex flex-wrap gap-2"><Chip onClick={() => answer("No code", { promoAsked: true })}>No code</Chip></div>}
          {ask.id === "confirm" && (
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <button type="button" disabled={busy} onClick={send} className="min-h-12 rounded-full bg-leaf-dark font-bold text-white disabled:opacity-60">{busy ? "Sending…" : "Yes, send my request"}</button>
              <button type="button" onClick={restart} className="min-h-12 rounded-full border-2 border-line px-4 font-bold text-navy">Start over</button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={submitText} className="flex items-center gap-2 bg-white p-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
        <label className="sr-only" htmlFor="chat-input">Message</label>
        <input
          ref={inputRef}
          id="chat-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputMode={ask.id === "phone" ? "tel" : ask.id === "field" && ask.field.kind === "stepper" ? "numeric" : "text"}
          autoComplete={ask.id === "phone" ? "tel" : ask.id === "name" ? "name" : ask.id === "suburb" ? "address-level2" : "off"}
          placeholder={placeholder(ask)}
          className="min-h-12 flex-1 rounded-full border border-line bg-mist px-4 text-[15px] focus:border-brand focus:bg-white focus:outline-none"
        />
        <button type="submit" className="grid h-12 w-12 place-items-center rounded-full bg-navy text-white transition hover:bg-brand" aria-label="Send"><Send className="h-5 w-5" aria-hidden /></button>
      </form>
    </div>
  );
}

function wantsText(ask: Ask) {
  return ask.id === "suburb" || ask.id === "name" || ask.id === "phone" || ask.id === "promo" || (ask.id === "field" && ask.field.kind === "text");
}

function placeholder(ask: Ask) {
  if (ask.id === "suburb") return "City or country…";
  if (ask.id === "name") return "Your name";
  if (ask.id === "phone") return "04xx xxx xxx";
  if (ask.id === "promo") return "Type a code, or tap No code";
  if (ask.id === "field" && ask.field.kind === "text") return ask.field.placeholder;
  if (ask.id === "field" && ask.field.kind === "stepper") return "Tap a number or type one";
  if (ask.id === "field" && ask.field.kind === "date") return "Pick a date above, or ask a question";
  return "Ask about check-in, parking, breakfast…";
}

function Chip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy transition hover:border-brand hover:bg-brand-light">
      {children}
    </button>
  );
}

function FieldReplies({ field, onPick }: { field: Field; onPick: (value: Detail, label: string) => void }) {
  if (field.kind === "stepper") {
    const top = Math.min(field.max, field.min === 0 ? 5 : 6);
    const numbers = Array.from({ length: top - field.min + 1 }, (_, index) => field.min + index);
    return (
      <div className="flex flex-wrap gap-2">
        {numbers.map((value) => <Chip key={value} onClick={() => onPick(value, value === 0 ? "None" : String(value))}>{value === 0 ? "None" : value}</Chip>)}
        <span className="self-center text-xs text-slate">More? Type the number below.</span>
      </div>
    );
  }
  if (field.kind === "toggle") {
    return (
      <div className="flex gap-2">
        <Chip onClick={() => onPick(true, "Yes")}>Yes</Chip>
        <Chip onClick={() => onPick(false, "No")}>No</Chip>
      </div>
    );
  }
  if (field.kind === "choice") {
    return <div className="flex flex-wrap gap-2">{field.options.map((option) => <Chip key={option} onClick={() => onPick(option, option)}>{option}</Chip>)}</div>;
  }
  return null;
}

function DateReplies({ onPick }: { onPick: (value: string) => void }) {
  const today = darwinISODate();
  const [value, setValue] = useState("");
  const quick = [
    ["Today", today],
    ["Tomorrow", addDaysIso(today, 1)],
    ["Next Friday", nextWeekday(today, 5)],
  ] as const;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">{quick.map(([label, date]) => <Chip key={label} onClick={() => onPick(date)}>{label}</Chip>)}</div>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="chat-date">Choose a date</label>
        <input id="chat-date" type="date" min={today} value={value} onChange={(event) => setValue(event.target.value)} className="min-h-11 flex-1 rounded-full border border-line bg-mist px-4 text-[15px] focus:border-brand focus:outline-none" />
        <button type="button" disabled={!value} onClick={() => onPick(value)} className="min-h-11 rounded-full bg-navy px-5 text-sm font-bold text-white disabled:opacity-40">Choose</button>
      </div>
    </div>
  );
}

/** The next given weekday (0 = Sunday … 6 = Saturday) after today. */
function nextWeekday(today: string, weekday: number) {
  const day = new Date(`${today}T00:00:00Z`).getUTCDay();
  return addDaysIso(today, ((weekday - day + 7) % 7) || 7);
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 border-b border-line py-2 last:border-0">
      <span className="w-16 shrink-0 font-semibold text-slate">{label}</span>
      <span className="whitespace-pre-line text-navy">{value}</span>
    </div>
  );
}

function locate(onFound: (suburb: string) => void, onError: (message: string) => void) {
  if (!navigator.geolocation) return onError("Location isn’t available on this device. Please type your suburb.");
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
        const data = await response.json();
        const suburb = data.address?.suburb || data.address?.town || data.address?.village || data.address?.city || "";
        if (suburb) onFound(suburb);
        else onError("I couldn’t work out the suburb from your location. Please type it.");
      } catch {
        onError("I couldn’t look up your location. Please type your suburb.");
      }
    },
    () => onError("Location permission was blocked. Please type your suburb."),
  );
}
