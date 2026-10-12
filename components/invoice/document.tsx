import Image from "next/image";
import { invoiceTotals, lineTotal, money } from "@/lib/invoice";
import type { Customer, Invoice, Job, Settings } from "@/lib/types";
import { cn, formatDisplayDate } from "@/lib/utils";

/** The invoice itself, as the customer sees and prints it. Used by the public link and the admin preview. */
export function InvoiceDocument({ invoice, customer, job, settings, className }: { invoice: Invoice; customer?: Customer; job?: Job; settings: Settings; className?: string }) {
  const tax = settings.invoice.gstRegistered;
  const totals = invoiceTotals(invoice, tax);
  const bank = settings.invoice;
  const hasBank = Boolean(bank.bsb || bank.accountNumber);
  return (
    <article className={cn("relative mx-auto w-full max-w-[820px] overflow-hidden bg-white p-5 text-ink sm:p-10 print:max-w-none print:p-0", className)}>
      {invoice.status === "paid" && <span className="absolute right-4 top-24 rotate-[-12deg] rounded-xl border-4 border-leaf-dark px-4 py-1 font-display text-3xl font-extrabold uppercase text-leaf-dark opacity-80 sm:right-10">Paid</span>}
      {invoice.status === "void" && <span className="absolute right-4 top-24 rotate-[-12deg] rounded-xl border-4 border-danger px-4 py-1 font-display text-3xl font-extrabold uppercase text-danger opacity-80 sm:right-10">Cancelled</span>}
      <header className="flex flex-col gap-6 border-b-4 border-navy pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Image src="/hvr-mark.png" alt="" width={56} height={56} className="h-14 w-14" />
          <div>
            <p className="font-display text-2xl font-extrabold text-navy">{settings.businessName}</p>
            <p className="text-sm text-slate">{[settings.abn && `ABN ${settings.abn}`, settings.phoneDisplay, settings.email].filter(Boolean).join(" · ")}</p>
            {settings.address && <p className="text-sm text-slate">{settings.address}</p>}
          </div>
        </div>
        <div className="sm:text-right">
          <p className="font-display text-3xl font-extrabold uppercase tracking-wide text-navy">{tax ? "Tax invoice" : "Invoice"}</p>
          <p className="mt-1 font-semibold">{invoice.number}</p>
        </div>
      </header>

      <section className="grid gap-6 py-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate">Bill to</p>
          {customer ? (
            <div className="mt-1">
              <p className="font-semibold text-navy">{customer.companyName || customer.name}</p>
              {customer.companyName && <p>Attn: {customer.name}</p>}
              {(customer.address || customer.suburb) && <p>{[customer.address, customer.suburb].filter(Boolean).join(", ")}</p>}
              <p className="text-sm text-slate">{[customer.phone, customer.email].filter(Boolean).join(" · ")}</p>
            </div>
          ) : <p className="mt-1 text-slate">Customer removed</p>}
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 sm:justify-self-end">
          <dt className="text-slate">Invoice date</dt><dd className="font-semibold">{formatDisplayDate(invoice.issueDate)}</dd>
          {invoice.dueDate && <><dt className="text-slate">Due date</dt><dd className="font-semibold">{formatDisplayDate(invoice.dueDate)}</dd></>}
          {job && <><dt className="text-slate">Job</dt><dd className="font-semibold">{job.reference}{job.completedDate ? `, done ${formatDisplayDate(job.completedDate)}` : ""}</dd></>}
          {job?.address && <><dt className="text-slate">Address</dt><dd>{job.address}</dd></>}
        </dl>
      </section>

      {/* Phones: one block per line. Wider screens and print: a table. */}
      <ul className="divide-y divide-line border-y border-line sm:hidden print:hidden">
        {invoice.items.map((item, index) => (
          <li key={index} className="py-3">
            <p className="whitespace-pre-wrap">{item.description}</p>
            <p className="mt-1 flex justify-between text-sm text-slate"><span>{item.quantity} × {money(item.unitPrice)}</span><span className="font-semibold text-ink">{money(lineTotal(item))}</span></p>
          </li>
        ))}
      </ul>
      <div className="hidden sm:block print:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-navy text-sm text-white print:bg-navy">
              <th className="rounded-l-lg px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 text-right font-semibold">Qty</th>
              <th className="px-3 py-2 text-right font-semibold">Price</th>
              <th className="rounded-r-lg px-3 py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-line align-top">
                <td className="whitespace-pre-wrap px-3 py-3">{item.description}</td>
                <td className="px-3 py-3 text-right">{item.quantity}</td>
                <td className="px-3 py-3 text-right">{money(item.unitPrice)}</td>
                <td className="px-3 py-3 text-right font-semibold">{money(lineTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-6 flex justify-end">
        <dl className="w-full max-w-xs space-y-1.5">
          <div className="flex justify-between"><dt className="text-slate">Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
          {totals.discount > 0 && <div className="flex justify-between"><dt className="text-slate">Discount</dt><dd>−{money(totals.discount)}</dd></div>}
          <div className="flex justify-between border-t-2 border-navy pt-2 text-lg font-extrabold text-navy"><dt>Total{tax ? " (inc. GST)" : ""}</dt><dd>{money(totals.total)}</dd></div>
          {tax && <div className="flex justify-between text-sm"><dt className="text-slate">GST included</dt><dd>{money(totals.gst)}</dd></div>}
          {!tax && <p className="text-right text-xs text-slate">No GST has been charged.</p>}
        </dl>
      </section>

      {(hasBank || invoice.notes) && (
        <section className="mt-8 grid gap-6 rounded-2xl bg-mist p-5 sm:grid-cols-2 print:bg-white print:ring-1 print:ring-line">
          {hasBank && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate">How to pay</p>
              <p className="mt-1 font-semibold text-navy">Bank transfer</p>
              <p>{bank.bankAccountName && <>Account name: {bank.bankAccountName}<br /></>}{bank.bsb && <>BSB: {bank.bsb}<br /></>}{bank.accountNumber && <>Account: {bank.accountNumber}<br /></>}Reference: {invoice.number}</p>
            </div>
          )}
          {invoice.notes && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate">Notes</p>
              <p className="mt-1 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </section>
      )}
      {settings.invoice.footer && <p className="mt-8 text-center text-sm text-slate">{settings.invoice.footer}</p>}
    </article>
  );
}
