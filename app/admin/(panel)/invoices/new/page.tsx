import Link from "next/link";
import { InvoiceEditor } from "@/components/admin/invoices";
import { parsePrice } from "@/lib/invoice";
import { getDb } from "@/lib/store";
import type { Invoice } from "@/lib/types";
import { nightsBetween } from "@/lib/constants";
import { darwinISODate, formatDisplayDate } from "@/lib/utils";

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** A new invoice, filled in from a job when there is one (?job=…), or for a customer (?customer=…). */
export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ job?: string; customer?: string }> }) {
  const params = await searchParams;
  const db = await getDb();
  const job = db.jobs.find((item) => item.id === params.job);
  const customerId = job?.customerId || (db.customers.some((item) => item.id === params.customer) ? params.customer! : "");
  const today = darwinISODate();
  const lines = job ? job.services.split("\n").map((line) => line.trim()).filter(Boolean) : [];
  const price = job ? parsePrice(job.price) : 0;
  // A room stay is invoiced as nights × the room's nightly rate.
  const room = job?.room ? db.services.find((service) => service.slug === job.room) : undefined;
  const nights = job ? nightsBetween(job.scheduledDate, job.endDate) : 0;
  const stayLine = room && nights > 0 ? [{ description: `${room.title} — ${formatDisplayDate(job!.scheduledDate)} to ${formatDisplayDate(job!.endDate)}`, quantity: nights, unitPrice: room.nightlyRate }] : null;
  const initial: Invoice = {
    id: "",
    number: "",
    token: "",
    customerId,
    jobId: job?.id ?? "",
    issueDate: today,
    dueDate: addDays(today, db.settings.invoice.termsDays),
    // One line per service on the job; the job's price goes on the first line.
    items: stayLine ?? (lines.length ? lines.map((description, index) => ({ description, quantity: 1, unitPrice: index === 0 ? price : 0 })) : [{ description: "", quantity: 1, unitPrice: 0 }]),
    discount: 0,
    notes: "",
    status: "draft",
    sentAt: "",
    paidAt: "",
    createdAt: "",
    updatedAt: "",
  };
  return (
    <div className="space-y-5">
      <Link href="/admin/invoices" className="text-sm font-semibold text-brand">← All invoices</Link>
      <h1 className="text-3xl font-bold text-navy">New invoice</h1>
      {job && <p className="text-slate">Filled in from booking {job.reference}. Add extras (breakfast, spa, transfers) before you create it.</p>}
      <InvoiceEditor initial={initial} customers={db.customers} jobs={db.jobs} gstRegistered={db.settings.invoice.gstRegistered} />
    </div>
  );
}
