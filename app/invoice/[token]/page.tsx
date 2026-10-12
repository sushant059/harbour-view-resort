import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvoiceDocument } from "@/components/invoice/document";
import { PrintButton } from "@/components/invoice/print-button";
import { getDb } from "@/lib/store";

export const metadata: Metadata = { title: "Invoice", robots: { index: false, follow: false } };

/** The customer's private invoice link. The long random token is the only way in. */
export default async function PublicInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{20,}$/.test(token)) notFound();
  const db = await getDb();
  const invoice = db.invoices.find((item) => item.token === token);
  if (!invoice || invoice.status === "draft") notFound();
  const customer = db.customers.find((item) => item.id === invoice.customerId);
  const job = db.jobs.find((item) => item.id === invoice.jobId);
  return (
    <main className="min-h-screen bg-mist px-3 py-6 sm:px-6 sm:py-10 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-[820px] flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-slate">Your invoice from {db.settings.businessName}</p>
        <PrintButton />
      </div>
      <InvoiceDocument invoice={invoice} customer={customer} job={job} settings={db.settings} className="rounded-card shadow-card print:rounded-none print:shadow-none" />
    </main>
  );
}
