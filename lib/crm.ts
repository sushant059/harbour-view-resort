import type { Booking, Customer, Database, Lead } from "@/lib/types";
import { addDaysIso, isRoomSlug } from "@/lib/constants";
import { uid } from "@/lib/utils";
import { normalizeAuPhone } from "@/lib/validators";

type CrmData = Pick<Database, "customers" | "jobs">;

const firstName = (name: string) => name.trim().toLowerCase().split(/\s+/)[0] ?? "";
const samePhone = (a: string, b: string) => Boolean(a && b) && (normalizeAuPhone(a) || a) === (normalizeAuPhone(b) || b);

/**
 * Finds the customer an enquiry belongs to. A phone match alone isn't enough
 * (families and offices share numbers), so the first name or the email must match too.
 */
export function matchCustomer(db: CrmData, person: { name: string; phone: string; email: string }): Customer | undefined {
  const email = person.email.trim().toLowerCase();
  return db.customers.find((customer) => {
    const emailMatch = Boolean(email) && customer.email.trim().toLowerCase() === email;
    const nameMatch = firstName(customer.name) !== "" && firstName(customer.name) === firstName(person.name);
    if (samePhone(customer.phone, person.phone)) return nameMatch || emailMatch;
    return emailMatch && nameMatch;
  });
}

function jobReference(existing: string[]) {
  const used = new Set(existing);
  let code = "";
  do code = `JOB-${Math.floor(10000 + Math.random() * 90000)}`;
  while (used.has(code));
  return code;
}

/**
 * Makes sure a website enquiry has a customer and a job. Runs inside the same save as the
 * enquiry, so nothing has to be created by hand. Safe to call twice for the same enquiry.
 */
export function linkEnquiry(db: CrmData, kind: "lead" | "booking", source: Lead | Booking, now = new Date().toISOString()) {
  const existingJob = db.jobs.find((job) => job.sourceRef && job.sourceRef === source.reference);
  if (existingJob) return { customerId: existingJob.customerId, jobId: existingJob.id, created: false };

  const booking = kind === "booking" ? (source as Booking) : undefined;
  const lead = kind === "lead" ? (source as Lead) : undefined;
  const phone = normalizeAuPhone(source.phone) || source.phone;
  const address = booking ? [booking.address, booking.suburb].filter(Boolean).join(", ") : "";
  const suburb = booking?.suburb || lead?.suburb || "";

  let customer = matchCustomer(db, { name: source.name, phone, email: source.email });
  if (customer) {
    if (!customer.email && source.email) customer.email = source.email;
    if (!customer.address && address) customer.address = address;
    if (!customer.suburb && suburb) customer.suburb = suburb;
    customer.updatedAt = now;
  } else {
    customer = {
      id: uid("cust"),
      type: "person",
      name: source.name,
      companyName: "",
      phone,
      email: source.email,
      address,
      suburb,
      notes: "",
      marketingOptIn: false,
      createdAt: now,
      updatedAt: now,
    };
    db.customers.unshift(customer);
  }

  // A chat enquiry for a room carries its dates in the answers: check-in + nights.
  const chatRoom = lead?.services.find(isRoomSlug) ?? "";
  const chatCheckIn = String(lead?.details?.checkIn ?? "");
  const chatNights = Number(lead?.details?.nights ?? 0);
  const chatStay = Boolean(chatRoom && /^\d{4}-\d{2}-\d{2}$/.test(chatCheckIn) && chatNights > 0);
  const guests = booking ? booking.guests : Number(lead?.details?.adults ?? 0) + Number(lead?.details?.children ?? 0);

  const channel = lead?.source === "chat" ? "chat" : lead?.source === "quote" ? "quote form" : "booking form";
  const extras = [
    lead?.preferredTime && `Preferred time: ${lead.preferredTime}`,
    lead?.message || booking?.notes,
    source.promoCode && `Promo: ${source.promoCode} (${source.promoMessage})`,
  ].filter(Boolean);
  const jobId = uid("job");
  db.jobs.unshift({
    id: jobId,
    reference: jobReference(db.jobs.map((job) => job.reference)),
    customerId: customer.id,
    services: (source.summary || "Enquiry").slice(0, 500),
    address: address || suburb,
    scheduledDate: booking?.date ?? (chatStay ? chatCheckIn : ""),
    timeWindow: booking?.timeWindow ?? "",
    endDate: booking?.checkOut ?? (chatStay ? addDaysIso(chatCheckIn, chatNights) : ""),
    room: booking?.room ?? (chatStay ? chatRoom : ""),
    guests: guests || 0,
    completedDate: "",
    price: "",
    status: "requested",
    notes: extras.join("\n"),
    beforePhotos: [],
    afterPhotos: lead?.photos ?? [],
    history: [{ at: now, status: "requested", note: `New request from the website ${channel} (${source.reference})` }],
    sourceRef: source.reference,
    createdAt: now,
    updatedAt: now,
  });
  return { customerId: customer.id, jobId, created: true };
}

/** When an enquiry is marked lost, its untouched request is cancelled so the room frees up. */
export function cancelRequestFor(db: CrmData, reference: string, now = new Date().toISOString()) {
  const job = db.jobs.find((item) => item.sourceRef === reference && item.status === "requested");
  if (!job) return null;
  job.status = "cancelled";
  job.updatedAt = now;
  job.history.push({ at: now, status: "cancelled", note: "Enquiry marked as lost" });
  return job;
}
