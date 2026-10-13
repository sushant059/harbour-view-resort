import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { cache } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { seedDatabase } from "@/lib/seed";
import type {
  BlockedDate,
  Booking,
  Customer,
  Invoice,
  InvoiceItem,
  Job,
  Database,
  Faq,
  IconName,
  Lead,
  MediaItem,
  Offer,
  Promo,
  ResultPair,
  Review,
  Service,
  ServiceCategory,
  Settings,
} from "@/lib/types";

// Hosts like Vercel only allow writing to /tmp. Without Supabase the site still works there
// for previewing, but saved data resets whenever the server restarts.
const filePath = process.env.VERCEL ? path.join("/tmp", "harbour-view-db.json") : path.join(process.cwd(), "data", "db.json");
let chain: Promise<unknown> = Promise.resolve();
let supabaseDown = false;

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function supabaseAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function usingSupabase() {
  return Boolean(supabaseAdmin()) && !supabaseDown;
}

async function readFileDb(): Promise<Database> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Database;
    if (!parsed?.settings || !parsed.services) return seedDatabase();
    return normalizeDb(parsed);
  } catch {
    const seeded = seedDatabase();
    await writeFileDb(seeded);
    return seeded;
  }
}

async function writeFileDb(db: Database) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(db, null, 2));
}

async function loadSupabaseSeeded(sb: SupabaseClient): Promise<Database> {
  return loadSupabase(sb, true);
}

const ICON_CATEGORY: Partial<Record<IconName, ServiceCategory>> = {
  bed: "rooms",
  crown: "suites-and-villas",
  waves: "suites-and-villas",
  users: "suites-and-villas",
  utensils: "dining",
  glass: "dining",
};

function categoryFor(slug: string, icon: IconName): ServiceCategory {
  const seeded = seedDatabase().services.find((service) => service.slug === slug);
  return seeded?.category ?? ICON_CATEGORY[icon] ?? "experiences";
}

const LEGACY_EMAIL = "regmisusanth94@gmail.com";

// Fills fields added after a database was first created, so older data keeps working.
export function normalizeDb(db: Database): Database {
  const fresh = seedDatabase();
  db.settings = { ...fresh.settings, ...db.settings };
  if (db.settings.email === LEGACY_EMAIL) db.settings.email = fresh.settings.email;
  if (db.settings.notificationEmail === LEGACY_EMAIL) db.settings.notificationEmail = fresh.settings.notificationEmail;
  db.services = db.services.map((service) => ({
    ...service,
    category: service.category || categoryFor(service.slug, service.icon),
    priceFrom: service.priceFrom ?? "",
    duration: service.duration ?? "",
    gallery: Array.isArray(service.gallery) ? service.gallery : [],
    rooms: Number(service.rooms) || 0,
    maxGuests: Number(service.maxGuests) || 2,
    nightlyRate: Number(service.nightlyRate) || 0,
  }));
  db.customers = Array.isArray(db.customers) ? db.customers : [];
  db.jobs = Array.isArray(db.jobs) ? db.jobs.map((job) => ({ ...job, timeWindow: job.timeWindow ?? "", endDate: job.endDate ?? "", room: job.room ?? "", guests: Number(job.guests) || 0 })) : [];
  db.settings.slotCapacity = Math.max(1, Number(db.settings.slotCapacity) || 1);
  db.campaigns = Array.isArray(db.campaigns) ? db.campaigns : [];
  db.invoices = Array.isArray(db.invoices) ? db.invoices : [];
  db.settings.invoice = { ...fresh.settings.invoice, ...(db.settings.invoice ?? {}) };
  const moments = Array.isArray(db.settings.dayMoments) && db.settings.dayMoments.length ? db.settings.dayMoments : fresh.settings.dayMoments;
  db.settings.dayMoments = moments.slice(0, 8).map((moment, index) => ({ ...(fresh.settings.dayMoments[index] ?? fresh.settings.dayMoments[0]), ...moment, image: moment.image ?? "" }));
  db.bookings = db.bookings.map((booking) => ({ ...booking, promoCode: booking.promoCode ?? "", promoMessage: booking.promoMessage ?? "", checkOut: booking.checkOut ?? "", room: booking.room ?? "", guests: Number(booking.guests) || 0 }));
  db.reviews = db.reviews.map((review) => {
    const legacy = review as Review & { visible?: boolean };
    return {
      ...review,
      status: review.status || (legacy.visible === false ? "pending" : "approved"),
      email: review.email ?? "",
      suburb: review.suburb ?? "",
    };
  });
  return db;
}

function asArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function mapSettings(row: Record<string, unknown>): Settings {
  return {
    businessName: String(row.business_name ?? ""),
    shortName: String(row.short_name ?? ""),
    phoneDisplay: String(row.phone_display ?? ""),
    phoneTel: String(row.phone_tel ?? ""),
    whatsappUrl: String(row.whatsapp_url ?? ""),
    email: String(row.email ?? ""),
    notificationEmail: String(row.notification_email ?? ""),
    address: String(row.address ?? ""),
    serviceAreas: asArray<string>(row.service_areas),
    facebook: String(row.facebook ?? ""),
    instagram: String(row.instagram ?? ""),
    tiktok: String(row.tiktok ?? ""),
    google: String(row.google_url ?? ""),
    youtube: String(row.youtube ?? ""),
    abn: String(row.abn ?? ""),
    licence: String(row.licence ?? ""),
    insurance: String(row.insurance ?? ""),
    openingHours: asArray(row.opening_hours),
    seoTitle: String(row.seo_title ?? ""),
    seoDescription: String(row.seo_description ?? ""),
    heroHeadline: String(row.hero_headline ?? ""),
    heroSubtext: String(row.hero_subtext ?? ""),
    heroImage: String(row.hero_image ?? ""),
    heroVideo: String(row.hero_video ?? ""),
    teamPhoto: String(row.team_photo ?? ""),
    ogImage: String(row.og_image ?? ""),
    stats: asArray(row.stats),
    slotCapacity: Math.max(1, Number(row.slot_capacity ?? 1) || 1),
    invoice: (row.invoice_settings && typeof row.invoice_settings === "object" ? row.invoice_settings : {}) as Settings["invoice"],
    dayMoments: asArray(row.day_moments),
  };
}

function settingsRow(settings: Settings) {
  return {
    id: 1,
    business_name: settings.businessName,
    short_name: settings.shortName,
    phone_display: settings.phoneDisplay,
    phone_tel: settings.phoneTel,
    whatsapp_url: settings.whatsappUrl,
    email: settings.email,
    notification_email: settings.notificationEmail,
    address: settings.address,
    service_areas: settings.serviceAreas,
    facebook: settings.facebook,
    instagram: settings.instagram,
    tiktok: settings.tiktok,
    google_url: settings.google,
    youtube: settings.youtube,
    abn: settings.abn,
    licence: settings.licence,
    insurance: settings.insurance,
    opening_hours: settings.openingHours,
    seo_title: settings.seoTitle,
    seo_description: settings.seoDescription,
    hero_headline: settings.heroHeadline,
    hero_subtext: settings.heroSubtext,
    hero_image: settings.heroImage,
    hero_video: settings.heroVideo,
    team_photo: settings.teamPhoto,
    og_image: settings.ogImage,
    stats: settings.stats,
    slot_capacity: settings.slotCapacity,
    invoice_settings: settings.invoice,
    day_moments: settings.dayMoments,
  };
}

function mapService(row: Record<string, unknown>): Service {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    summary: String(row.summary ?? ""),
    description: String(row.description ?? ""),
    included: asArray<string>(row.included),
    bestFor: asArray<string>(row.best_for),
    process: asArray(row.process),
    faqs: asArray(row.faqs),
    icon: (row.icon as Service["icon"]) || "layers",
    category: (row.category as Service["category"]) || categoryFor(String(row.slug), (row.icon as Service["icon"]) || "layers"),
    priceFrom: String(row.price_from ?? ""),
    duration: String(row.duration ?? ""),
    image: String(row.image ?? ""),
    videoUrl: String(row.video_url ?? ""),
    gallery: asArray<string>(row.gallery),
    order: Number(row.sort_order ?? 0),
    visible: Boolean(row.visible),
    related: asArray<string>(row.related),
    rooms: Number(row.rooms ?? 0) || 0,
    maxGuests: Number(row.max_guests ?? 2) || 2,
    nightlyRate: Number(row.nightly_rate ?? 0) || 0,
  };
}

function serviceRow(service: Service) {
  return {
    id: service.id,
    slug: service.slug,
    title: service.title,
    summary: service.summary,
    description: service.description,
    included: service.included,
    best_for: service.bestFor,
    process: service.process,
    faqs: service.faqs,
    icon: service.icon,
    category: service.category,
    price_from: service.priceFrom,
    duration: service.duration,
    image: service.image,
    video_url: service.videoUrl,
    gallery: service.gallery,
    sort_order: service.order,
    visible: service.visible,
    related: service.related,
    rooms: service.rooms,
    max_guests: service.maxGuests,
    nightly_rate: service.nightlyRate,
  };
}

async function expect<T>(result: { data: T; error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

async function loadSupabase(sb: SupabaseClient, seedIfEmpty: boolean): Promise<Database> {
  const settingsRows = await expect(await sb.from("site_settings").select("*").eq("id", 1).maybeSingle());
  if (!settingsRows) {
    if (!seedIfEmpty) throw new Error("Supabase settings could not be seeded.");
    await syncSupabase(sb, null, seedDatabase());
    return loadSupabase(sb, false);
  }
  const [services, offers, promos, leads, bookings, results, reviews, faqs, blocked, media, customers, jobs, campaigns, invoices] = await Promise.all([
    expect(await sb.from("services").select("*")),
    expect(await sb.from("offers").select("*")),
    expect(await sb.from("promo_codes").select("*")),
    expect(await sb.from("leads").select("*").order("created_at", { ascending: false })),
    expect(await sb.from("bookings").select("*").order("created_at", { ascending: false })),
    expect(await sb.from("before_after").select("*")),
    expect(await sb.from("reviews").select("*")),
    expect(await sb.from("faqs").select("*")),
    expect(await sb.from("blocked_dates").select("*")),
    expect(await sb.from("media").select("*")),
    expect(await sb.from("customers").select("*").order("created_at", { ascending: false })),
    expect(await sb.from("jobs").select("*").order("created_at", { ascending: false })),
    expect(await sb.from("campaigns").select("*").order("created_at", { ascending: false })),
    expect(await sb.from("invoices").select("*").order("created_at", { ascending: false })),
  ]);
  return normalizeDb({
    version: 1,
    settings: mapSettings(settingsRows as Record<string, unknown>),
    services: (services as Record<string, unknown>[]).map(mapService),
    offers: (offers as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      title: String(row.title),
      description: String(row.description ?? ""),
      bannerText: String(row.banner_text ?? ""),
      href: String(row.href ?? ""),
      image: String(row.image ?? ""),
      active: Boolean(row.active),
      startsAt: String(row.starts_at ?? ""),
      endsAt: String(row.ends_at ?? ""),
      showOnBanner: Boolean(row.show_on_banner),
      order: Number(row.sort_order ?? 0),
    })),
    promos: (promos as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      code: String(row.code),
      type: row.discount_type === "fixed" ? "fixed" : "percent",
      amount: Number(row.amount ?? 0),
      message: String(row.message ?? ""),
      expiresAt: String(row.expires_at ?? ""),
      usageLimit: row.usage_limit == null ? null : Number(row.usage_limit),
      usedCount: Number(row.used_count ?? 0),
      active: Boolean(row.active),
    })),
    leads: (leads as Record<string, unknown>[]).map(mapLead),
    bookings: (bookings as Record<string, unknown>[]).map(mapBooking),
    results: (results as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      serviceSlug: String(row.service_slug),
      caption: String(row.caption ?? ""),
      scene: String(row.scene ?? "carpet"),
      beforeImage: String(row.before_image ?? ""),
      afterImage: String(row.after_image ?? ""),
      illustrative: Boolean(row.illustrative),
      order: Number(row.sort_order ?? 0),
    })),
    reviews: (reviews as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      text: String(row.body ?? ""),
      service: String(row.service ?? ""),
      rating: Number(row.rating ?? 5),
      date: String(row.review_date ?? ""),
      source: (row.source as Review["source"]) || "manual",
      status: (row.status as Review["status"]) || (row.visible ? "approved" : "pending"),
      email: String(row.email ?? ""),
      suburb: String(row.suburb ?? ""),
      order: Number(row.sort_order ?? 0),
    })),
    faqs: (faqs as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      category: String(row.category),
      question: String(row.question),
      answer: String(row.answer),
      order: Number(row.sort_order ?? 0),
    })),
    blockedDates: (blocked as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      date: String(row.blocked_on),
      reason: String(row.reason ?? ""),
    })),
    media: (media as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      url: String(row.url),
      kind: row.kind === "video" ? "video" : "image",
      slot: String(row.slot ?? ""),
      createdAt: String(row.created_at),
    })),
    customers: (customers as Record<string, unknown>[]).map(mapCustomer),
    jobs: (jobs as Record<string, unknown>[]).map(mapJob),
    campaigns: (campaigns as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      title: String(row.title ?? ""),
      message: String(row.message ?? ""),
      channel: row.channel === "sms" || row.channel === "email" ? row.channel : "whatsapp",
      recipientIds: asArray<string>(row.recipient_ids),
      createdAt: String(row.created_at),
    })),
    invoices: (invoices as Record<string, unknown>[]).map(mapInvoice),
  });
}

function mapInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: String(row.id),
    number: String(row.number ?? ""),
    token: String(row.token ?? ""),
    customerId: String(row.customer_id ?? ""),
    jobId: String(row.job_id ?? ""),
    issueDate: String(row.issue_date ?? ""),
    dueDate: String(row.due_date ?? ""),
    items: asArray<InvoiceItem>(row.items).map((item) => ({ description: String(item.description ?? ""), quantity: Number(item.quantity) || 0, unitPrice: Number(item.unitPrice) || 0 })),
    discount: Number(row.discount ?? 0) || 0,
    notes: String(row.notes ?? ""),
    status: (["draft", "sent", "paid", "void"].includes(String(row.status)) ? row.status : "draft") as Invoice["status"],
    sentAt: String(row.sent_at ?? ""),
    paidAt: String(row.paid_at ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at ?? row.created_at),
  };
}

export function invoiceRow(invoice: Invoice) {
  return {
    id: invoice.id,
    number: invoice.number,
    token: invoice.token,
    customer_id: invoice.customerId,
    job_id: invoice.jobId,
    issue_date: invoice.issueDate || null,
    due_date: invoice.dueDate || null,
    items: invoice.items,
    discount: invoice.discount,
    notes: invoice.notes,
    status: invoice.status,
    sent_at: invoice.sentAt || null,
    paid_at: invoice.paidAt || null,
    created_at: invoice.createdAt,
    updated_at: invoice.updatedAt,
  };
}

function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: String(row.id),
    type: row.type === "company" ? "company" : "person",
    name: String(row.name ?? ""),
    companyName: String(row.company_name ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    address: String(row.address ?? ""),
    suburb: String(row.suburb ?? ""),
    notes: String(row.notes ?? ""),
    marketingOptIn: Boolean(row.marketing_opt_in),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at ?? row.created_at),
  };
}

export function customerRow(customer: Customer) {
  return {
    id: customer.id,
    type: customer.type,
    name: customer.name,
    company_name: customer.companyName,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    suburb: customer.suburb,
    notes: customer.notes,
    marketing_opt_in: customer.marketingOptIn,
    created_at: customer.createdAt,
    updated_at: customer.updatedAt,
  };
}

function mapJob(row: Record<string, unknown>): Job {
  return {
    id: String(row.id),
    reference: String(row.reference ?? ""),
    customerId: String(row.customer_id ?? ""),
    services: String(row.services ?? ""),
    address: String(row.address ?? ""),
    scheduledDate: String(row.scheduled_date ?? ""),
    timeWindow: String(row.time_window ?? ""),
    endDate: String(row.end_date ?? ""),
    room: String(row.room ?? ""),
    guests: Number(row.guests ?? 0) || 0,
    completedDate: String(row.completed_date ?? ""),
    price: String(row.price ?? ""),
    status: (row.status as Job["status"]) || "scheduled",
    notes: String(row.notes ?? ""),
    beforePhotos: asArray<string>(row.before_photos),
    afterPhotos: asArray<string>(row.after_photos),
    history: asArray(row.history),
    sourceRef: String(row.source_ref ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at ?? row.created_at),
  };
}

export function jobRow(job: Job) {
  return {
    id: job.id,
    reference: job.reference,
    customer_id: job.customerId,
    services: job.services,
    address: job.address,
    scheduled_date: job.scheduledDate || null,
    time_window: job.timeWindow,
    end_date: job.endDate || null,
    room: job.room,
    guests: job.guests,
    completed_date: job.completedDate || null,
    price: job.price,
    status: job.status,
    notes: job.notes,
    before_photos: job.beforePhotos,
    after_photos: job.afterPhotos,
    history: job.history,
    source_ref: job.sourceRef,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  };
}

function mapLead(row: Record<string, unknown>): Lead {
  return {
    id: String(row.id),
    reference: String(row.reference),
    source: (row.source as Lead["source"]) || "quote",
    status: (row.status as Lead["status"]) || "new",
    name: String(row.name ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    suburb: String(row.suburb ?? ""),
    services: asArray<string>(row.services),
    details: (row.details as Lead["details"]) || {},
    summary: String(row.summary ?? ""),
    notes: String(row.notes ?? ""),
    internalNotes: String(row.internal_notes ?? ""),
    promoCode: String(row.promo_code ?? ""),
    promoMessage: String(row.promo_message ?? ""),
    photos: asArray<string>(row.photos),
    message: String(row.message ?? ""),
    preferredTime: String(row.preferred_time ?? ""),
    createdAt: String(row.created_at),
  };
}

export function leadRow(lead: Lead) {
  return {
    id: lead.id,
    reference: lead.reference,
    source: lead.source,
    status: lead.status,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    suburb: lead.suburb,
    services: lead.services,
    details: lead.details,
    summary: lead.summary,
    notes: lead.notes,
    internal_notes: lead.internalNotes,
    promo_code: lead.promoCode,
    promo_message: lead.promoMessage,
    photos: lead.photos,
    message: lead.message,
    preferred_time: lead.preferredTime,
    created_at: lead.createdAt,
  };
}

function mapBooking(row: Record<string, unknown>): Booking {
  return {
    id: String(row.id),
    reference: String(row.reference),
    status: (row.status as Booking["status"]) || "new",
    name: String(row.name ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    services: asArray<string>(row.services),
    details: (row.details as Booking["details"]) || {},
    summary: String(row.summary ?? ""),
    date: String(row.appointment_date ?? ""),
    timeWindow: String(row.time_window ?? ""),
    address: String(row.address ?? ""),
    suburb: String(row.suburb ?? ""),
    notes: String(row.notes ?? ""),
    internalNotes: String(row.internal_notes ?? ""),
    promoCode: String(row.promo_code ?? ""),
    promoMessage: String(row.promo_message ?? ""),
    checkOut: String(row.check_out ?? ""),
    room: String(row.room ?? ""),
    guests: Number(row.guests ?? 0) || 0,
    createdAt: String(row.created_at),
  };
}

export function bookingRow(booking: Booking) {
  return {
    id: booking.id,
    reference: booking.reference,
    status: booking.status,
    name: booking.name,
    phone: booking.phone,
    email: booking.email,
    services: booking.services,
    details: booking.details,
    summary: booking.summary,
    appointment_date: booking.date,
    time_window: booking.timeWindow,
    address: booking.address,
    suburb: booking.suburb,
    notes: booking.notes,
    internal_notes: booking.internalNotes,
    promo_code: booking.promoCode,
    promo_message: booking.promoMessage,
    check_out: booking.checkOut || null,
    room: booking.room,
    guests: booking.guests,
    created_at: booking.createdAt,
  };
}

type Row = Record<string, unknown>;
type Snapshot = { settings: string; tables: Record<string, Row[]> };

function snapshot(db: Database): Snapshot {
  const tables: Record<string, Row[]> = {};
  const replaceRows = (table: string, rows: Row[]) => {
    tables[table] = rows;
  };
  replaceRows("services", db.services.map(serviceRow));
  replaceRows(
    "offers",
    db.offers.map((offer) => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      banner_text: offer.bannerText,
      href: offer.href,
      image: offer.image,
      active: offer.active,
      starts_at: offer.startsAt || null,
      ends_at: offer.endsAt || null,
      show_on_banner: offer.showOnBanner,
      sort_order: offer.order,
    })),
  );
  replaceRows(
    "promo_codes",
    db.promos.map((promo) => ({
      id: promo.id,
      code: promo.code,
      discount_type: promo.type,
      amount: promo.amount,
      message: promo.message,
      expires_at: promo.expiresAt || null,
      usage_limit: promo.usageLimit,
      used_count: promo.usedCount,
      active: promo.active,
    })),
  );
  replaceRows("leads", db.leads.map(leadRow));
  replaceRows("bookings", db.bookings.map(bookingRow));
  replaceRows(
    "before_after",
    db.results.map((item) => ({
      id: item.id,
      service_slug: item.serviceSlug,
      caption: item.caption,
      scene: item.scene,
      before_image: item.beforeImage,
      after_image: item.afterImage,
      illustrative: item.illustrative,
      sort_order: item.order,
    })),
  );
  replaceRows(
    "reviews",
    db.reviews.map((review) => ({
      id: review.id,
      name: review.name,
      body: review.text,
      service: review.service,
      rating: review.rating,
      review_date: review.date || null,
      source: review.source,
      status: review.status,
      visible: review.status === "approved",
      email: review.email,
      suburb: review.suburb,
      sort_order: review.order,
    })),
  );
  replaceRows(
    "faqs",
    db.faqs.map((faq) => ({
      id: faq.id,
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      sort_order: faq.order,
    })),
  );
  replaceRows(
    "blocked_dates",
    db.blockedDates.map((item) => ({ id: item.id, blocked_on: item.date, reason: item.reason })),
  );
  replaceRows(
    "media",
    db.media.map((item) => ({
      id: item.id,
      name: item.name,
      url: item.url,
      kind: item.kind,
      slot: item.slot,
      created_at: item.createdAt,
    })),
  );
  replaceRows("customers", db.customers.map(customerRow));
  replaceRows("jobs", db.jobs.map(jobRow));
  replaceRows(
    "campaigns",
    db.campaigns.map((item) => ({ id: item.id, title: item.title, message: item.message, channel: item.channel, recipient_ids: item.recipientIds, created_at: item.createdAt })),
  );
  replaceRows("invoices", db.invoices.map(invoiceRow));
  return { settings: JSON.stringify(settingsRow(db.settings)), tables };
}

// Writes only what changed: upserts new or edited rows and deletes removed ones.
// The old version deleted every row and re-inserted the lot on each save, which
// could lose data if an insert failed half way.
async function syncSupabase(sb: SupabaseClient, before: Snapshot | null, db: Database) {
  const after = snapshot(db);
  if (!before || before.settings !== after.settings) {
    const settings = await sb.from("site_settings").upsert(settingsRow(db.settings));
    if (settings.error) throw new Error(settings.error.message);
  }
  for (const [table, rows] of Object.entries(after.tables)) {
    const previous = new Map((before?.tables[table] ?? []).map((row) => [String(row.id), JSON.stringify(row)]));
    const changed = rows.filter((row) => previous.get(String(row.id)) !== JSON.stringify(row));
    const keep = new Set(rows.map((row) => String(row.id)));
    const removed = [...previous.keys()].filter((id) => !keep.has(id));
    if (changed.length) {
      const upserted = await sb.from(table).upsert(changed);
      if (upserted.error) throw new Error(upserted.error.message);
    }
    if (removed.length) {
      const deleted = await sb.from(table).delete().in("id", removed);
      if (deleted.error) throw new Error(deleted.error.message);
    }
  }
}


async function loadUncached(): Promise<Database> {
  const sb = supabaseAdmin();
  if (sb && !supabaseDown) {
    try {
      return await loadSupabaseSeeded(sb);
    } catch (error) {
      console.error("Supabase read failed, using local data.", error);
      supabaseDown = true;
    }
  }
  return readFileDb();
}

export const getDb = cache(loadUncached);

export async function updateDb(fn: (db: Database) => void) {
  const run = chain.then(async () => {
    const sb = supabaseAdmin();
    if (sb && !supabaseDown) {
      try {
        const db = await loadSupabase(sb, true);
        const before = snapshot(db);
        fn(db);
        await syncSupabase(sb, before, db);
        return db;
      } catch (error) {
        console.error("Supabase write failed, using local data.", error);
        supabaseDown = true;
      }
    }
    const db = await readFileDb();
    fn(db);
    await writeFileDb(db);
    return db;
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function storeMediaFile(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "") || "file";
  const key = `${Date.now()}-${safe}`;
  const sb = supabaseAdmin();
  if (sb && !supabaseDown) {
    const uploaded = await sb.storage.from("media").upload(key, bytes, { contentType: file.type, upsert: false });
    if (uploaded.error) throw new Error(uploaded.error.message);
    return sb.storage.from("media").getPublicUrl(key).data.publicUrl;
  }
  if (process.env.VERCEL) throw new Error("Connect Supabase to upload photos and videos on the live site.");
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, key), bytes);
  return `/uploads/${key}`;
}

export type { BlockedDate, Booking, Faq, Lead, MediaItem, Offer, Promo, ResultPair, Review, Service, Settings };
