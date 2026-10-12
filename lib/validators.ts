import { z } from "zod";
import { darwinISODate } from "@/lib/utils";
import type { Promo } from "@/lib/types";

export function normalizeAuPhone(input: string) {
  let digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+61")) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith("61") && digits.length === 11) digits = `0${digits.slice(2)}`;
  if (/^0[2378]\d{8}$/.test(digits) || /^04\d{8}$/.test(digits)) return digits;
  // International guests: keep the full +country number.
  if (/^\+\d{8,15}$/.test(digits)) return digits;
  return null;
}

export const auPhone = z
  .string()
  .trim()
  .refine((value) => normalizeAuPhone(value) !== null, "Enter a phone number, like 0401 647 545 or +65 9123 4567.");

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((value) => value === "" || /^https?:\/\/.+/i.test(value), "Enter a full http or https link, or leave it blank.");

export const quoteSchema = z.object({
  service: z.string().trim().min(1, "Choose a service"),
  size: z.string().trim().min(2, "Tell us roughly how big the job is").max(160),
  suburb: z.string().trim().min(2, "Enter your suburb").max(80),
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: auPhone,
  email: z.string().trim().email("Enter a valid email address").max(120),
  notes: z.string().trim().max(2000),
  promo: z.string().trim().max(40),
  company_website: z.string(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email address").max(120),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((value) => value === "" || normalizeAuPhone(value) !== null, "Enter an Australian phone number, or leave it blank."),
  message: z.string().trim().min(10, "Add a short message").max(2000),
  company_website: z.string(),
});

export const chatSchema = z.object({
  services: z.array(z.string()).min(1, "Choose at least one service"),
  details: z.record(z.union([z.string(), z.number(), z.boolean()])),
  suburb: z.string().trim().min(2, "Enter your suburb").max(120),
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: auPhone,
  preferredTime: z.string().trim().max(40),
  promo: z.string().trim().max(40),
  company_website: z.string(),
});

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");

/** A room booking request: room type, dates and guests. */
export const bookingSchema = z.object({
  room: z.string().min(1, "Choose a room"),
  checkIn: isoDay,
  checkOut: isoDay,
  adults: z.number().int().min(1, "At least one adult").max(10),
  children: z.number().int().min(0).max(10),
  breakfast: z.boolean(),
  transfer: z.boolean(),
  lateCheckout: z.boolean(),
  arrival: z.string().max(20),
  from: z.string().trim().max(80),
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: auPhone,
  email: z.string().trim().email("Enter a valid email address").max(120),
  notes: z.string().trim().max(2000),
  promo: z.string().trim().max(40),
  company_website: z.string(),
});

export const reviewSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(60),
  email: z.string().trim().max(120).refine((value) => value === "" || z.string().email().safeParse(value).success, "Enter a valid email or leave it blank"),
  suburb: z.string().trim().max(60),
  service: z.string().trim().max(80),
  rating: z.number().int().min(1, "Choose a star rating").max(5),
  text: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(1200),
  company_website: z.string(),
});

export function isPastDate(isoDate: string, today = darwinISODate()) {
  return isoDate < today;
}

export function checkPromo(code: string, promos: Promo[], today = darwinISODate()) {
  const trimmed = code.trim();
  if (!trimmed) return { ok: false as const, message: "" };
  const found = promos.find((promo) => promo.code.toLowerCase() === trimmed.toLowerCase());
  if (!found || !found.active) return { ok: false as const, message: "That code is not active." };
  if (found.expiresAt && found.expiresAt < today) return { ok: false as const, message: "That code has expired." };
  if (found.usageLimit != null && found.usedCount >= found.usageLimit) {
    return { ok: false as const, message: "That code has reached its usage limit." };
  }
  return { ok: true as const, message: found.message, promo: found };
}

export function isOfferLive(offer: { active: boolean; startsAt: string; endsAt: string }, today = darwinISODate()) {
  if (!offer.active) return false;
  if (offer.startsAt && offer.startsAt > today) return false;
  if (offer.endsAt && offer.endsAt < today) return false;
  return true;
}

export function matchSuburb(input: string, areas: string[]) {
  const query = input.trim().toLowerCase();
  if (!query) return { match: null as string | null, suggestions: [] as string[] };
  const exact = areas.find((area) => area.toLowerCase() === query);
  if (exact) return { match: exact, suggestions: [] as string[] };
  const partial = areas.filter((area) => area.toLowerCase().includes(query) || query.includes(area.toLowerCase()));
  return { match: partial.length === 1 ? partial[0] : null, suggestions: partial.slice(0, 6) };
}

export const optionalUrlSchema = optionalUrl;

export type QuoteInput = z.infer<typeof quoteSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
