import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceActions, InvoiceEditor, InvoiceStatusBadge } from "@/components/admin/invoices";
import { InvoiceDocument } from "@/components/invoice/document";
import { emailEnabled } from "@/lib/email";
import { invoiceTotals, money } from "@/lib/invoice";
import { smsEnabled } from "@/lib/sms";
import { getDb } from "@/lib/store";
import { darwinISODate, siteUrl } from "@/lib/utils";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const invoice = db.invoices.find((item) => item.id === id);
  if (!invoice) notFound();
  const customer = db.customers.find((item) => item.id === invoice.customerId);
  const job = db.jobs.find((item) => item.id === invoice.jobId);
  const total = money(invoiceTotals(invoice, db.settings.invoice.gstRegistered).total);
  const bankMissing = !db.settings.invoice.bsb || !db.settings.invoice.accountNumber;
  return (
    <div className="space-y-5">
      <Link href="/admin/invoices" className="text-sm font-semibold text-brand">← All invoices</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold text-navy">{invoice.number}</h1>
        <InvoiceStatusBadge invoice={invoice} today={darwinISODate()} />
        <span className="font-display text-2xl font-extrabold text-navy">{total}</span>
        {customer && <Link href={`/admin/customers/${customer.id}`} className="text-sm font-semibold text-brand">{customer.companyName || customer.name} →</Link>}
      </div>
      {bankMissing && <p className="rounded-2xl bg-sun-soft p-3 text-sm text-[#7A4E00]">Add your bank details (BSB and account number) in <Link href="/admin/settings" className="font-semibold underline">Settings → Invoices</Link> so customers know how to pay.</p>}
      <InvoiceActions invoice={invoice} customer={customer} link={`${siteUrl()}/invoice/${invoice.token}`} emailReady={emailEnabled()} smsReady={smsEnabled()} total={total} shortName={db.settings.shortName} />
      <details className="group rounded-card bg-white shadow-card" open={invoice.status === "draft"}>
        <summary className="cursor-pointer list-none p-4 text-lg font-bold text-navy sm:p-5 [&::-webkit-details-marker]:hidden">Edit invoice <span className="text-sm font-normal text-slate group-open:hidden">(tap to open)</span></summary>
        <div className="px-1 pb-1 sm:px-2 sm:pb-2">
          <InvoiceEditor key={invoice.updatedAt} initial={invoice} customers={db.customers} jobs={db.jobs} gstRegistered={db.settings.invoice.gstRegistered} />
        </div>
      </details>
      <section>
        <h2 className="mb-3 text-xl font-bold text-navy">What the customer sees</h2>
        <InvoiceDocument invoice={invoice} customer={customer} job={job} settings={db.settings} className="rounded-card shadow-card" />
      </section>
    </div>
  );
}
