import type { IconName, ServiceCategory } from "@/lib/types";

export const SERVICE_CATEGORIES: { id: ServiceCategory; title: string; short: string; blurb: string; icon: IconName }[] = [
  { id: "rooms", title: "Rooms", short: "Rooms", blurb: "Calm, light-filled rooms with harbour or garden outlooks, king beds and rain showers.", icon: "bed" },
  { id: "suites-and-villas", title: "Suites & Villas", short: "Suites", blurb: "Space to spread out: harbour suites, family suites and private pool villas.", icon: "crown" },
  { id: "dining", title: "Dining & Bar", short: "Dining", blurb: "Waterfront breakfast, long lunches and sunset cocktails at the Saltwater Bar.", icon: "utensils" },
  { id: "experiences", title: "Spa & Experiences", short: "Experiences", blurb: "Day spa, harbour cruises, weddings and private airport transfers.", icon: "spa" },
];

export const SERVICE_CATEGORY_IDS = SERVICE_CATEGORIES.map((category) => category.id);

/** Room categories are booked by the night; the rest are enquiries. */
export const ROOM_CATEGORIES: ServiceCategory[] = ["rooms", "suites-and-villas"];

/** A stay moves through these. Ids are shared with the general job model. */
export const JOB_STATUSES = [
  { id: "requested", label: "New request", tone: "bg-sun-soft text-[#7A5200]" },
  { id: "scheduled", label: "Confirmed", tone: "bg-brand-light text-brand" },
  { id: "in-progress", label: "Checked in", tone: "bg-[#E6F0FF] text-[#1D4E9E]" },
  { id: "done", label: "Checked out", tone: "bg-leaf-soft text-leaf-dark" },
  { id: "complaint", label: "Complaint", tone: "bg-red-50 text-danger" },
  { id: "redo", label: "Follow-up", tone: "bg-[#F1E8FF] text-[#6B2FB3]" },
  { id: "cancelled", label: "Cancelled", tone: "bg-mist text-slate" },
] as const;

export const STATUS_OPTIONS = ["new", "contacted", "quoted", "booked", "completed", "lost"] as const;

/** Arrival windows, for planning check-ins and transfers. */
export const TIME_WINDOWS = [
  { id: "early", label: "Before 2pm (early check-in request)" },
  { id: "afternoon", label: "2pm – 6pm" },
  { id: "evening", label: "6pm – 10pm" },
  { id: "late", label: "After 10pm" },
] as const;

export const PREFERRED_TIMES = ["Any time", "Morning", "Afternoon", "Evening", "Email me instead"] as const;

export const NAV_LINKS = [
  { href: "/services", label: "Rooms & Suites" },
  { href: "/results", label: "Gallery" },
  { href: "/offers", label: "Packages" },
  { href: "/reviews", label: "Reviews" },
  { href: "/why-us", label: "The Resort" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
] as const;

export type Field =
  | { kind: "stepper"; key: string; label: string; min: number; max: number; defaultValue: number; ask?: string }
  | { kind: "toggle"; key: string; label: string; ask?: string }
  | { kind: "choice"; key: string; label: string; options: string[]; ask?: string }
  | { kind: "date"; key: string; label: string; ask?: string }
  | { kind: "text"; key: string; label: string; placeholder: string; ask?: string };

/** The question the chat assistant asks for a field. */
export function fieldQuestion(field: Field) {
  if (field.ask) return field.ask;
  if (field.kind === "stepper") return `How many ${field.label.toLowerCase()}?`;
  if (field.kind === "toggle") return `${field.label}?`;
  if (field.kind === "choice") return `${field.label}?`;
  if (field.kind === "date") return `${field.label}?`;
  return field.label;
}

// Every room type asks the same stay questions; the keys are shared, so booking two room types asks once.
const STAY_FIELDS: Field[] = [
  { kind: "date", key: "checkIn", label: "Check-in date", ask: "Lovely choice. What date would you like to check in?" },
  { kind: "stepper", key: "nights", label: "Nights", ask: "How many nights would you like to stay?", min: 1, max: 30, defaultValue: 2 },
  { kind: "stepper", key: "adults", label: "Adults", ask: "How many adults?", min: 1, max: 8, defaultValue: 2 },
  { kind: "stepper", key: "children", label: "Children", ask: "And any children (under 12)?", min: 0, max: 6, defaultValue: 0 },
  { kind: "toggle", key: "breakfast", label: "Daily breakfast", ask: "Would you like daily breakfast included?" },
  { kind: "toggle", key: "transfer", label: "Airport transfer", ask: "Shall we arrange a private airport transfer?" },
];

export const ROOM_SLUGS = ["harbour-king", "garden-twin", "family-suite", "harbour-suite", "pool-villa", "sky-penthouse"] as const;

export const SERVICE_FIELDS: Record<string, Field[]> = {
  ...Object.fromEntries(ROOM_SLUGS.map((slug) => [slug, STAY_FIELDS])),
  "saltwater-restaurant": [
    { kind: "date", key: "diningDate", label: "Date", ask: "Which date would you like a table?" },
    { kind: "choice", key: "sitting", label: "Sitting", ask: "Breakfast, lunch or dinner?", options: ["Breakfast", "Lunch", "Dinner", "Sunset drinks"] },
    { kind: "stepper", key: "diners", label: "Guests", ask: "How many guests at the table?", min: 1, max: 20, defaultValue: 2 },
  ],
  "day-spa": [
    { kind: "date", key: "spaDate", label: "Date", ask: "Which day would you like your treatment?" },
    { kind: "choice", key: "treatment", label: "Treatment", ask: "Which treatment interests you?", options: ["Massage", "Facial", "Couples ritual", "Not sure yet"] },
    { kind: "stepper", key: "spaGuests", label: "People", ask: "For how many people?", min: 1, max: 6, defaultValue: 1 },
  ],
  "weddings-and-events": [
    { kind: "choice", key: "eventType", label: "Event type", ask: "What are you celebrating?", options: ["Wedding", "Birthday", "Corporate", "Other"] },
    { kind: "date", key: "eventDate", label: "Event date", ask: "Do you have a date in mind?" },
    { kind: "stepper", key: "eventGuests", label: "Guests", ask: "Roughly how many guests?", min: 2, max: 300, defaultValue: 40 },
  ],
  "airport-transfers": [
    { kind: "date", key: "transferDate", label: "Date", ask: "What date do you need the transfer?" },
    { kind: "choice", key: "direction", label: "Direction", ask: "To the resort or to the airport?", options: ["Airport → resort", "Resort → airport", "Both ways"] },
    { kind: "stepper", key: "passengers", label: "Passengers", ask: "How many passengers?", min: 1, max: 10, defaultValue: 2 },
  ],
  "something-else": [
    { kind: "text", key: "other", label: "Tell us what you need", ask: "Of course. How can we help?", placeholder: "A short description is enough" },
  ],
};

export const CHAT_OPTIONS: { slug: string; label: string; icon: IconName }[] = [
  { slug: "harbour-king", label: "Harbour King Room", icon: "bed" },
  { slug: "garden-twin", label: "Garden Twin Room", icon: "bed" },
  { slug: "family-suite", label: "Family Suite", icon: "users" },
  { slug: "harbour-suite", label: "Harbour Suite", icon: "crown" },
  { slug: "pool-villa", label: "Private Pool Villa", icon: "waves" },
  { slug: "sky-penthouse", label: "Sky Penthouse", icon: "crown" },
  { slug: "saltwater-restaurant", label: "Restaurant table", icon: "utensils" },
  { slug: "day-spa", label: "Day spa", icon: "spa" },
  { slug: "weddings-and-events", label: "Weddings & events", icon: "glass" },
  { slug: "airport-transfers", label: "Airport transfer", icon: "car" },
  { slug: "something-else", label: "Something else", icon: "sun" },
];

export const SERVICE_TITLES: Record<string, string> = {
  "harbour-king": "Harbour King Room",
  "garden-twin": "Garden Twin Room",
  "family-suite": "Family Suite",
  "harbour-suite": "Harbour Suite",
  "pool-villa": "Private Pool Villa",
  "sky-penthouse": "Sky Penthouse",
  "saltwater-restaurant": "Saltwater Restaurant & Bar",
  "day-spa": "Mangrove Day Spa",
  "weddings-and-events": "Weddings & events",
  "airport-transfers": "Airport transfers",
  "something-else": "Something else",
};

export function isRoomSlug(slug: string) {
  return (ROOM_SLUGS as readonly string[]).includes(slug);
}

/** "2026-10-14" + 3 → "2026-10-17" */
export function addDaysIso(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86_400_000));
}

export function defaultDetails(slugs: string[]) {
  const details: Record<string, string | number | boolean> = {};
  for (const slug of slugs) {
    for (const field of SERVICE_FIELDS[slug] ?? []) {
      if (field.kind === "stepper") details[field.key] = field.defaultValue;
      if (field.kind === "toggle") details[field.key] = false;
      if (field.kind === "choice") details[field.key] = "";
      if (field.kind === "text" || field.kind === "date") details[field.key] = "";
    }
  }
  return details;
}

export function summariseJob(slugs: string[], details: Record<string, string | number | boolean>) {
  return slugs.map((slug) => {
    const parts = (SERVICE_FIELDS[slug] ?? [])
      .map((field) => {
        const value = details[field.key];
        if (value === undefined || value === "" || value === false || value === 0) return "";
        if (typeof value === "boolean") return field.label;
        return `${field.label}: ${value}`;
      })
      .filter(Boolean);
    const title = SERVICE_TITLES[slug] ?? slug;
    return parts.length ? `${title} — ${parts.join(", ")}` : title;
  });
}

export function validateDetails(slugs: string[], details: Record<string, string | number | boolean>, today = "") {
  for (const slug of slugs) {
    for (const field of SERVICE_FIELDS[slug] ?? []) {
      if (field.kind !== "date") continue;
      const value = String(details[field.key] || "");
      // Event dates can be "not decided yet"; everything else needs a real date.
      if (!value && field.key === "eventDate") continue;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return `Choose the ${field.label.toLowerCase()}.`;
      if (today && value < today) return `The ${field.label.toLowerCase()} can't be in the past.`;
    }
    if (isRoomSlug(slug)) {
      if (Number(details.nights || 0) < 1) return "Stay at least one night.";
      if (Number(details.adults || 0) < 1) return "At least one adult needs to stay.";
    }
    if (slug === "something-else" && String(details.other || "").trim().length < 3) return "Tell us a little about what you need.";
  }
  return null;
}

export function timeWindowLabel(id: string) {
  return TIME_WINDOWS.find((window) => window.id === id)?.label ?? id;
}
