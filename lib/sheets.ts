import type { Booking, Customer, Database, Job, Lead } from "@/lib/types";
import { JOB_STATUSES, timeWindowLabel } from "@/lib/constants";

/*
 * Mirrors customers, jobs, leads and bookings into a Google Sheet.
 * The sheet runs the Apps Script in google-sheets/Code.gs, published as a web app.
 * Set GOOGLE_SHEETS_WEBHOOK_URL and GOOGLE_SHEETS_SECRET to switch it on.
 * Supabase stays the source of truth; the sheet is a readable copy.
 */

export type SheetTab = "Customers" | "Jobs" | "Leads" | "Bookings";
type SheetRow = Record<string, string | number | boolean>;

export function sheetsEnabled() {
  return Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL && process.env.GOOGLE_SHEETS_SECRET);
}

const list = (items: string[]) => items.filter(Boolean).join("\n");
/** "0401 647 545" stays text in Google Sheets, so the leading 0 isn't dropped. */
const phoneText = (phone: string) => (/^0\d{9}$/.test(phone) ? `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}` : phone);

/** Plain-English job status for the sheet. */
export const SHEET_STATUS: Record<string, string> = {
  requested: "New request",
  scheduled: "Confirmed",
  "in-progress": "Checked in",
  done: "Checked out",
  complaint: "Complaint",
  redo: "Follow-up",
  cancelled: "Cancelled",
};
const statusLabel = (status: string) => SHEET_STATUS[status] ?? JOB_STATUSES.find((item) => item.id === status)?.label ?? status;

const sameKey = (customer: Customer) => `${customer.phone.replace(/\D/g, "")}|${customer.name.trim().toLowerCase().replace(/\s+/g, " ")}`;

/**
 * One sheet row per real person: customers with the same name and phone share the oldest record's row,
 * however many jobs they have. Returns the record that represents each customer.
 */
export function canonicalCustomer(customer: Customer, customers: Customer[]) {
  const key = sameKey(customer);
  return customers.filter((item) => sameKey(item) === key).sort((x, y) => x.createdAt.localeCompare(y.createdAt))[0] ?? customer;
}

export function customerSheetRow(customer: Customer): SheetRow {
  return {
    ID: customer.id,
    Name: customer.companyName ? `${customer.name} (${customer.companyName})` : customer.name,
    Phone: phoneText(customer.phone),
    Email: customer.email,
    Address: [customer.address, customer.suburb].filter(Boolean).join(", "),
  };
}

/** Rows to write and stale duplicate rows to remove for the given customers. */
export function customerSheetChanges(db: Database, customerIds: string[]) {
  const upsert = new Map<string, SheetRow>();
  const remove = new Set<string>();
  for (const customer of db.customers.filter((item) => customerIds.includes(item.id))) {
    const main = canonicalCustomer(customer, db.customers);
    upsert.set(main.id, customerSheetRow(main));
    if (main.id !== customer.id) remove.add(customer.id);
  }
  return { upsert: [...upsert.values()], remove: [...remove] };
}

export function jobSheetRow(job: Job, customers: Customer[]): SheetRow {
  const customer = customers.find((item) => item.id === job.customerId);
  return {
    ID: job.id,
    "Booking no.": job.reference,
    Guest: customer ? (customer.companyName ? `${customer.name} (${customer.companyName})` : customer.name) : "",
    Phone: phoneText(customer?.phone ?? ""),
    Booking: job.services,
    "Check-in": job.scheduledDate,
    "Check-out": job.endDate,
    Guests: job.guests || "",
    Arrival: job.timeWindow ? timeWindowLabel(job.timeWindow) : "",
    Price: job.price,
    Status: statusLabel(job.status),
    Updated: job.updatedAt.slice(0, 16).replace("T", " "),
  };
}

export function leadSheetRow(lead: Lead): SheetRow {
  return {
    ID: lead.id,
    Reference: lead.reference,
    Source: lead.source,
    Status: lead.status,
    Name: lead.name,
    Phone: phoneText(lead.phone),
    Email: lead.email,
    Suburb: lead.suburb,
    Details: lead.summary,
    Message: lead.message,
    "Preferred time": lead.preferredTime,
    "Promo code": lead.promoCode,
    Photos: list(lead.photos),
    "Internal notes": lead.internalNotes,
    Created: lead.createdAt,
  };
}

export function bookingSheetRow(booking: Booking): SheetRow {
  return {
    ID: booking.id,
    Reference: booking.reference,
    Status: booking.status,
    Name: booking.name,
    Phone: phoneText(booking.phone),
    Email: booking.email,
    "Check-in": booking.date,
    "Check-out": booking.checkOut,
    Room: booking.room,
    Guests: booking.guests || "",
    Arrival: booking.timeWindow ? timeWindowLabel(booking.timeWindow) : "",
    "Travelling from": booking.suburb,
    Details: booking.summary,
    Notes: booking.notes,
    "Promo code": booking.promoCode,
    "Internal notes": booking.internalNotes,
    Created: booking.createdAt,
  };
}

type SheetResult = { ok: boolean; error?: string };

/** Turns what the Apps Script sent back into a plain-English problem, if there is one. */
function explain(status: number, text: string): SheetResult {
  let body: { ok?: boolean; error?: string } | null = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }
  if (body?.ok) return { ok: true };
  if (body?.error === "Wrong secret") {
    return { ok: false, error: "The secret in the Apps Script doesn't match GOOGLE_SHEETS_SECRET in Vercel. Paste the right SECRET into Code.gs, Save, then Deploy → Manage deployments → Edit → Version: New version → Deploy." };
  }
  if (body?.error) return { ok: false, error: `The Apps Script replied: ${body.error}` };
  if (/<html|<!doctype/i.test(text)) {
    return { ok: false, error: "Google returned a web page instead of running the script. In Apps Script open Deploy → Manage deployments → Edit and set “Who has access” to “Anyone” (not “Anyone with Google account”), then deploy a new version." };
  }
  return { ok: false, error: `The sheet script didn't answer properly (HTTP ${status}). Check that GOOGLE_SHEETS_WEBHOOK_URL is the Web app URL ending in /exec.` };
}

async function post(payload: Record<string, unknown>): Promise<SheetResult> {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_SECRET;
  if (!url || !secret) return { ok: false, error: "Google Sheets isn't connected yet." };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, ...payload }),
      redirect: "follow",
      // Apps Script can take 10–20 seconds to wake up when it hasn't run for a while.
      signal: AbortSignal.timeout(30_000),
    });
    const result = explain(response.status, await response.text());
    if (!result.ok) console.error("Google Sheets sync failed", payload.tab, result.error);
    return result;
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    console.error("Google Sheets sync failed", payload.tab, error);
    return { ok: false, error: timedOut ? "The sheet script took too long to answer. Try again in a minute." : "Couldn't reach the sheet script. Check the Web app URL." };
  }
}

/** Sends upserts and deletes for one tab. Never throws: a sheet outage must not block the site. */
export async function syncSheet(tab: SheetTab, upsert: SheetRow[], remove: string[] = []) {
  if (!sheetsEnabled()) return false;
  if (!upsert.length && !remove.length) return true;
  return (await post({ tab, upsert, delete: remove })).ok;
}

/** Checks the script answers and accepts our secret, without changing the sheet. */
export async function testSheetConnection() {
  return post({ tab: "Customers", upsert: [], delete: [] });
}

/** Pushes every customer, job, lead and booking. Used by the "Sync everything now" button. */
export async function syncEverything(db: Database): Promise<SheetResult> {
  const check = await testSheetConnection();
  if (!check.ok) return check;
  // One tab at a time: the script handles one request at a time anyway.
  const tabs: [SheetTab, SheetRow[]][] = [
    ["Customers", customerSheetChanges(db, db.customers.map((customer) => customer.id)).upsert],
    ["Jobs", db.jobs.map((job) => jobSheetRow(job, db.customers))],
    ["Leads", db.leads.map(leadSheetRow)],
    ["Bookings", db.bookings.map(bookingSheetRow)],
  ];
  for (const [tab, rows] of tabs) {
    if (!rows.length) continue;
    const result = await post({ tab, upsert: rows, delete: [] });
    if (!result.ok) return result;
  }
  return { ok: true };
}
