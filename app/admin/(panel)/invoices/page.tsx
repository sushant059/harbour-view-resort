import Link from "next/link";
import { InvoicesBoard } from "@/components/admin/invoices";
import { getDb } from "@/lib/store";
import { darwinISODate } from "@/lib/utils";

export default async function InvoicesPage() {
  const db = await getDb();
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Invoices</h1>
          <p className="mt-1 text-slate">Create invoices, send them by email, text or WhatsApp, and keep track of who has paid.</p>
        </div>
        <Link href="/admin/invoices/new" className="inline-flex min-h-12 items-center rounded-full bg-leaf-dark px-6 font-semibold text-white hover:bg-[#1d6a19]">New invoice</Link>
      </div>
      <InvoicesBoard invoices={db.invoices} customers={db.customers} gstRegistered={db.settings.invoice.gstRegistered} today={darwinISODate()} />
    </div>
  );
}
