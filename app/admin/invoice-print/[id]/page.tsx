import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvoiceDocument } from "@/components/invoice/document";
import { PrintButton } from "@/components/invoice/print-button";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/store";

export const metadata: Metadata = { title: "Print invoice", robots: { index: false, follow: false } };

/** Admin-only print view, so drafts can be printed before they are sent. */
export default async function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const db = await getDb();
  const invoice = db.invoices.find((item) => item.id === id);
  if (!invoice) notFound();
  return (
    <main className="min-h-screen bg-mist px-3 py-6 sm:px-6 sm:py-10 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-[820px] justify-end print:hidden"><PrintButton /></div>
      <InvoiceDocument invoice={invoice} customer={db.customers.find((item) => item.id === invoice.customerId)} job={db.jobs.find((item) => item.id === invoice.jobId)} settings={db.settings} className="rounded-card shadow-card print:rounded-none print:shadow-none" />
    </main>
  );
}
