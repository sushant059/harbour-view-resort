"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Mail, MessageCircle, Plus, Printer, Smartphone, Trash2 } from "lucide-react";
import { deleteInvoiceAction, saveInvoiceAction, sendInvoiceAction, setInvoiceStatusAction } from "@/lib/actions";
import { displayName } from "@/components/admin/customers";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toaster";
import { invoiceTotals, isOverdue, lineTotal, money } from "@/lib/invoice";
import type { Customer, Invoice, InvoiceItem, InvoiceStatus, Job } from "@/lib/types";
import { cn, formatDisplayDate, waLink } from "@/lib/utils";

const STATUS: Record<InvoiceStatus | "overdue", { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "bg-mist text-slate" },
  sent: { label: "Sent – unpaid", tone: "bg-brand-light text-brand" },
  overdue: { label: "Overdue", tone: "bg-red-50 text-danger" },
  paid: { label: "Paid", tone: "bg-leaf-soft text-leaf-dark" },
  void: { label: "Cancelled", tone: "bg-mist text-slate line-through" },
};

export function InvoiceStatusBadge({ invoice, today }: { invoice: Invoice; today: string }) {
  const key = isOverdue(invoice, today) ? "overdue" : invoice.status;
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold", STATUS[key].tone)}>{STATUS[key].label}</span>;
}

/* ---------------------------------- List ---------------------------------- */

export function InvoicesBoard({ invoices, customers, gstRegistered, today }: { invoices: Invoice[]; customers: Customer[]; gstRegistered: boolean; today: string }) {
  const [filter, setFilter] = useState<"all" | "unpaid" | "overdue" | "paid" | "draft">("all");
  const total = (invoice: Invoice) => invoiceTotals(invoice, gstRegistered).total;
  const unpaid = invoices.filter((item) => item.status === "sent");
  const overdue = unpaid.filter((item) => isOverdue(item, today));
  const month = today.slice(0, 7);
  const paidMonth = invoices.filter((item) => item.status === "paid" && item.paidAt.slice(0, 7) === month);
  const visible = invoices.filter((item) =>
    filter === "all" ? true : filter === "unpaid" ? item.status === "sent" : filter === "overdue" ? isOverdue(item, today) : item.status === filter,
  );
  const sum = (items: Invoice[]) => money(items.reduce((acc, item) => acc + total(item), 0));
  const tiles = [
    { id: "unpaid" as const, label: "Waiting for payment", value: sum(unpaid), count: unpaid.length },
    { id: "overdue" as const, label: "Overdue", value: sum(overdue), count: overdue.length },
    { id: "paid" as const, label: "Paid this month", value: sum(paidMonth), count: paidMonth.length },
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <button key={tile.id} type="button" onClick={() => setFilter(filter === tile.id ? "all" : tile.id)} className={cn("rounded-card bg-white p-4 text-left shadow-card", filter === tile.id && "ring-2 ring-navy")}>
            <p className="text-sm text-slate">{tile.label}</p>
            <p className={cn("mt-1 font-display text-2xl font-extrabold", tile.id === "overdue" && tile.count ? "text-danger" : "text-navy")}>{tile.value}</p>
            <p className="text-xs text-slate">{tile.count} invoice{tile.count === 1 ? "" : "s"}</p>
          </button>
        ))}
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {(["all", "draft", "unpaid", "overdue", "paid"] as const).map((item) => (
          <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold", filter === item ? "bg-navy text-white" : "bg-white text-navy shadow-card")}>
            {item === "all" ? "All" : item === "unpaid" ? "Unpaid" : item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {visible.map((invoice) => {
          const customer = customers.find((item) => item.id === invoice.customerId);
          return (
            <li key={invoice.id}>
              <Link href={`/admin/invoices/${invoice.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-card bg-white p-4 shadow-card hover:ring-2 hover:ring-brand/30">
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-navy">{invoice.number} · {customer ? displayName(customer) : "Customer removed"}</span>
                  <span className="block text-sm text-slate">{formatDisplayDate(invoice.issueDate)}{invoice.dueDate ? ` · due ${formatDisplayDate(invoice.dueDate)}` : ""}</span>
                </span>
                <span className="font-display text-lg font-extrabold text-navy">{money(total(invoice))}</span>
                <InvoiceStatusBadge invoice={invoice} today={today} />
              </Link>
            </li>
          );
        })}
      </ul>
      {visible.length === 0 && <p className="rounded-card bg-white p-6 text-slate shadow-card">{invoices.length ? "No invoices in this filter." : "No invoices yet. Create one here, or from a job with “Create invoice”."}</p>}
    </div>
  );
}

/* --------------------------------- Editor --------------------------------- */

const blankItem = (): InvoiceItem => ({ description: "", quantity: 1, unitPrice: 0 });

export function InvoiceEditor({ initial, customers, jobs, gstRegistered }: { initial: Invoice; customers: Customer[]; jobs: Job[]; gstRegistered: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [invoice, setInvoice] = useState<Invoice>(initial);
  const isNew = !initial.number;
  const totals = invoiceTotals(invoice, gstRegistered);
  const customerJobs = useMemo(() => jobs.filter((job) => job.customerId === invoice.customerId), [jobs, invoice.customerId]);
  const sortedCustomers = useMemo(() => [...customers].sort((a, b) => displayName(a).localeCompare(displayName(b))), [customers]);

  const setItem = (index: number, patch: Partial<InvoiceItem>) => setInvoice((value) => ({ ...value, items: value.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) }));
  const num = (text: string) => (text === "" ? 0 : Number(text));

  function save() {
    start(async () => {
      const result = await saveInvoiceAction(invoice);
      toast(result.ok ? result.message || "Saved" : result.error, result.ok ? "ok" : "error");
      if (!result.ok) return;
      if (isNew && result.id) router.push(`/admin/invoices/${result.id}`);
      else router.refresh();
    });
  }

  return (
    <form className="space-y-5 rounded-card bg-white p-4 shadow-card sm:p-6" onSubmit={(event) => { event.preventDefault(); save(); }}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="i-customer">Customer</Label>
          <Select id="i-customer" value={invoice.customerId} onChange={(event) => setInvoice({ ...invoice, customerId: event.target.value, jobId: "" })}>
            <option value="">Choose a customer…</option>
            {sortedCustomers.map((customer) => <option key={customer.id} value={customer.id}>{displayName(customer)}{customer.phone ? ` · ${customer.phone}` : ""}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="i-job">Job (optional)</Label>
          <Select id="i-job" value={invoice.jobId} disabled={!invoice.customerId} onChange={(event) => setInvoice({ ...invoice, jobId: event.target.value })}>
            <option value="">No job linked</option>
            {customerJobs.map((job) => <option key={job.id} value={job.id}>{job.reference} · {job.services.split("\n")[0].slice(0, 50)}</option>)}
          </Select>
        </div>
        <div><Label htmlFor="i-issue">Invoice date</Label><Input id="i-issue" type="date" value={invoice.issueDate} onChange={(event) => setInvoice({ ...invoice, issueDate: event.target.value })} /></div>
        <div><Label htmlFor="i-due">Due date</Label><Input id="i-due" type="date" value={invoice.dueDate} onChange={(event) => setInvoice({ ...invoice, dueDate: event.target.value })} /></div>
      </div>

      <div>
        <p className="font-semibold text-navy">What you’re charging for{gstRegistered && <span className="font-normal text-slate"> (prices include GST)</span>}</p>
        <ul className="mt-2 space-y-3">
          {invoice.items.map((item, index) => (
            <li key={index} className="rounded-2xl border border-line p-3">
              <Label htmlFor={`i-desc-${index}`} className="sr-only">Description</Label>
              <Textarea id={`i-desc-${index}`} className="min-h-14" placeholder="e.g. Carpet steam clean – 3 bedrooms and hallway" value={item.description} onChange={(event) => setItem(index, { description: event.target.value })} />
              <div className="mt-2 grid grid-cols-[1fr_1.4fr_auto] items-end gap-2 sm:grid-cols-[120px_160px_1fr_auto]">
                <div><Label htmlFor={`i-qty-${index}`}>Qty</Label><Input id={`i-qty-${index}`} type="number" inputMode="decimal" min="0" step="any" value={item.quantity || ""} onChange={(event) => setItem(index, { quantity: num(event.target.value) })} /></div>
                <div><Label htmlFor={`i-price-${index}`}>Price each ($)</Label><Input id={`i-price-${index}`} type="number" inputMode="decimal" min="0" step="0.01" value={item.unitPrice || ""} onChange={(event) => setItem(index, { unitPrice: num(event.target.value) })} /></div>
                <p className="hidden pb-3 text-right font-bold text-navy sm:block">{money(lineTotal(item))}</p>
                <Button type="button" size="icon" variant="ghost" aria-label="Remove line" disabled={invoice.items.length === 1} onClick={() => setInvoice({ ...invoice, items: invoice.items.filter((_, i) => i !== index) })}><Trash2 className="h-4 w-4" aria-hidden /></Button>
              </div>
            </li>
          ))}
        </ul>
        <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => setInvoice({ ...invoice, items: [...invoice.items, blankItem()] })}><Plus className="h-4 w-4" aria-hidden /> Add a line</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="i-discount">Discount ($, e.g. a promo code)</Label>
          <Input id="i-discount" type="number" inputMode="decimal" min="0" step="0.01" value={invoice.discount || ""} onChange={(event) => setInvoice({ ...invoice, discount: num(event.target.value) })} />
          <Label htmlFor="i-notes" className="mt-3">Note on the invoice (optional)</Label>
          <Textarea id="i-notes" className="min-h-20" placeholder="e.g. Thanks! 10% off with WELCOME10 applied." value={invoice.notes} onChange={(event) => setInvoice({ ...invoice, notes: event.target.value })} />
        </div>
        <dl className="h-fit space-y-1.5 rounded-2xl bg-mist p-4">
          <div className="flex justify-between"><dt className="text-slate">Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
          {totals.discount > 0 && <div className="flex justify-between"><dt className="text-slate">Discount</dt><dd>−{money(totals.discount)}</dd></div>}
          <div className="flex justify-between border-t border-line pt-2 text-xl font-extrabold text-navy"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
          {gstRegistered ? <div className="flex justify-between text-sm"><dt className="text-slate">GST included</dt><dd>{money(totals.gst)}</dd></div> : <p className="text-xs text-slate">No GST (turn on “Registered for GST” in Settings if you are).</p>}
        </dl>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>{isNew ? "Create invoice" : "Save changes"}</Button>
        {!isNew && <Button type="button" variant="ghost" onClick={() => setInvoice(initial)}>Undo changes</Button>}
      </div>
    </form>
  );
}

/* --------------------------------- Actions -------------------------------- */

export function InvoiceActions({ invoice, customer, link, emailReady, smsReady, total, shortName }: { invoice: Invoice; customer?: Customer; link: string; emailReady: boolean; smsReady: boolean; total: string; shortName: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const first = customer?.name.trim().split(/\s+/)[0] || "there";
  const due = invoice.dueDate ? `, due ${formatDisplayDate(invoice.dueDate)}` : "";
  const text = `Hi ${first}, here's your ${shortName} invoice ${invoice.number} for ${total}${due}: ${link}`;
  const closed = invoice.status === "void";

  function run(work: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    start(async () => {
      const result = await work();
      toast(result.ok ? result.message || "Done" : result.error || "Something went wrong", result.ok ? "ok" : "error");
      if (result.ok) router.refresh();
    });
  }

  // Opening the email app, Messages or WhatsApp yourself: the invoice is marked sent so its link works.
  const markSentOnOpen = () => {
    if (invoice.status === "draft") run(() => setInvoiceStatusAction(invoice.id, "sent"));
  };

  const mailto = `mailto:${customer?.email ?? ""}?subject=${encodeURIComponent(`Invoice ${invoice.number} from ${shortName} – ${total}`)}&body=${encodeURIComponent(`${text}\n\nThanks,\n${shortName}`)}`;
  const sms = `sms:${customer?.phone ?? ""}?&body=${encodeURIComponent(text)}`;

  return (
    <section className="space-y-4 rounded-card bg-white p-4 shadow-card sm:p-5">
      <h2 className="text-xl font-bold text-navy">Send & get paid</h2>
      {!closed && (
        <div className="grid gap-2 sm:grid-cols-3">
          {customer?.email ? (
            emailReady ? (
              <Button type="button" variant="navy" disabled={pending} onClick={() => run(() => sendInvoiceAction(invoice.id, "email"))}><Mail className="h-4 w-4" aria-hidden /> Email invoice</Button>
            ) : (
              <a href={mailto} onClick={markSentOnOpen} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-navy px-5 font-semibold text-white"><Mail className="h-4 w-4" aria-hidden /> Email invoice</a>
            )
          ) : <p className="rounded-2xl bg-mist p-3 text-sm text-slate">No email saved for this customer.</p>}
          {customer?.phone ? (
            smsReady ? (
              <Button type="button" variant="outline" disabled={pending} onClick={() => run(() => sendInvoiceAction(invoice.id, "sms"))}><Smartphone className="h-4 w-4" aria-hidden /> Text invoice</Button>
            ) : (
              <a href={sms} onClick={markSentOnOpen} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-navy/15 px-5 font-semibold text-navy"><Smartphone className="h-4 w-4" aria-hidden /> Text invoice</a>
            )
          ) : null}
          {customer?.phone && (
            <a href={waLink(customer.phone, text)} target="_blank" rel="noopener noreferrer" onClick={markSentOnOpen} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-5 font-semibold text-white"><MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp</a>
          )}
        </div>
      )}
      <p className="text-sm text-slate">
        The customer gets a private link to view, print or save the invoice as a PDF{emailReady ? "" : ". Email opens your email app with the message ready"}{smsReady ? "" : "; Text opens your phone’s Messages app"}.
        {invoice.sentAt && ` Last sent ${formatDisplayDate(invoice.sentAt.slice(0, 10))}.`}
      </p>
      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        <a href={invoice.status === "draft" ? `/admin/invoice-print/${invoice.id}` : link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full border-2 border-navy/15 px-4 text-sm font-semibold text-navy hover:border-brand"><Printer className="h-4 w-4" aria-hidden /> Print / PDF</a>
        {invoice.status !== "draft" && <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-brand hover:bg-brand-light"><ExternalLink className="h-4 w-4" aria-hidden /> Customer’s view</a>}
        {invoice.status !== "paid" && !closed && <Button type="button" size="sm" disabled={pending} onClick={() => run(() => setInvoiceStatusAction(invoice.id, "paid"))}><Check className="h-4 w-4" aria-hidden /> Mark paid</Button>}
        {invoice.status === "paid" && <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => run(() => setInvoiceStatusAction(invoice.id, "sent"))}>Mark unpaid</Button>}
        {invoice.status === "draft" && <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => run(() => setInvoiceStatusAction(invoice.id, "sent"))}>Mark as sent</Button>}
        {!closed && invoice.status !== "paid" && <ConfirmDialog title="Cancel this invoice?" body="It stays in your records marked as cancelled. The customer's link will show it as cancelled." confirmLabel="Cancel invoice" onConfirm={() => run(() => setInvoiceStatusAction(invoice.id, "void"))} trigger={<Button type="button" size="sm" variant="ghost">Cancel invoice</Button>} />}
        {closed && <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => run(() => setInvoiceStatusAction(invoice.id, "draft"))}>Restore as draft</Button>}
        <ConfirmDialog title="Delete this invoice?" body="It is removed for good, and the customer's link stops working." confirmLabel="Delete" onConfirm={() => start(async () => { const result = await deleteInvoiceAction(invoice.id); toast(result.ok ? result.message || "Deleted" : result.error, result.ok ? "ok" : "error"); if (result.ok) router.push("/admin/invoices"); })} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
      </div>
    </section>
  );
}
