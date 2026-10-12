import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

export function makeReference() {
  return `HVR-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function uniqueReference(existing: string[]) {
  const used = new Set(existing);
  let code = makeReference();
  while (used.has(code)) code = makeReference();
  return code;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function filled(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

export function safeHttpUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
  } catch {
    return "";
  }
  return "";
}

export function darwinISODate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Darwin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatDisplayDate(iso: string) {
  if (!iso) return "";
  const date = iso.length <= 10 ? new Date(`${iso}T00:00:00+09:30`) : new Date(iso);
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Darwin",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDisplayDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Darwin",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function waLink(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "61");
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function siteUrl() {
  // On Vercel, fall back to the production domain so links in emails and texts never point at localhost.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "";
  return (process.env.NEXT_PUBLIC_SITE_URL || vercel || "http://localhost:3000").replace(/\/$/, "");
}

export function byOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

export function moveByOrder<T extends { id: string; order: number }>(items: T[], id: string, direction: -1 | 1) {
  const sorted = [...items].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const index = sorted.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= sorted.length) return items;
  const [item] = sorted.splice(index, 1);
  sorted.splice(target, 0, item);
  const next = sorted.map((entry, order) => ({ ...entry, order: order + 1 }));
  const ids = new Map(next.map((entry) => [entry.id, entry]));
  return items.map((entry) => ids.get(entry.id) ?? entry);
}

export function toCsv(rows: Record<string, string | number | boolean | null | undefined>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number | boolean | null | undefined) => {
    const text = value == null ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}
