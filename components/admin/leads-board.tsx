"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { convertToCustomerAction, deleteBookingAction, deleteLeadAction, deleteBlockedDateAction, saveBlockedDateAction, updateBookingAction, updateLeadAction } from "@/lib/actions";
import { STATUS_OPTIONS } from "@/lib/constants";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toaster";
import type { BlockedDate, Booking, Lead, LeadStatus } from "@/lib/types";
import { formatDisplayDateTime, waLink } from "@/lib/utils";

export function LeadsBoard({ leads, bookings, blocked }: { leads: Lead[]; bookings: Booking[]; blocked: BlockedDate[] }) {
  const [tab, setTab] = useState<"leads" | "bookings">("leads");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const haystack = `${lead.name} ${lead.phone} ${lead.email} ${lead.suburb} ${lead.reference} ${lead.summary}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (status === "all" || lead.status === status) && (source === "all" || lead.source === source);
  }), [leads, query, status, source]);
  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    const haystack = `${booking.name} ${booking.phone} ${booking.suburb} ${booking.reference} ${booking.summary}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (status === "all" || booking.status === status);
  }), [bookings, query, status]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={`rounded-full px-4 py-2 font-semibold ${tab === "leads" ? "bg-brand text-white" : "bg-white"}`} onClick={() => setTab("leads")}>Leads</button>
        <button type="button" className={`rounded-full px-4 py-2 font-semibold ${tab === "bookings" ? "bg-brand text-white" : "bg-white"}`} onClick={() => setTab("bookings")}>Bookings</button>
        <a className="ml-auto text-sm font-semibold text-brand" href={tab === "leads" ? "/api/admin/export?type=leads" : "/api/admin/export?type=bookings"}>Download CSV</a>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone, suburb, reference" aria-label="Search" />
        <select className="min-h-12 rounded-input border border-line bg-white px-3" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        {tab === "leads" && (
          <select className="min-h-12 rounded-input border border-line bg-white px-3" value={source} onChange={(event) => setSource(event.target.value)} aria-label="Filter by source">
            <option value="all">All sources</option>
            <option value="quote">Quote</option>
            <option value="chat">Chat</option>
            <option value="contact">Contact</option>
          </select>
        )}
      </div>
      <div className="space-y-3">
        {tab === "leads" && filteredLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
        {tab === "bookings" && filteredBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
        {tab === "leads" && filteredLeads.length === 0 && <p className="rounded-card bg-white p-4 text-slate">No leads match.</p>}
        {tab === "bookings" && filteredBookings.length === 0 && <p className="rounded-card bg-white p-4 text-slate">No bookings match.</p>}
      </div>
      <BlockedDates blocked={blocked} />
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [notes, setNotes] = useState(lead.internalNotes);
  return (
    <article className="rounded-card bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold">{lead.reference} · {lead.name || "No name"}</p>
          <p className="text-sm text-slate">{lead.source} · {formatDisplayDateTime(lead.createdAt)} · {lead.suburb}</p>
        </div>
        <select className="min-h-11 rounded-input border px-3 capitalize" aria-label={`Status for ${lead.reference}`} value={lead.status} disabled={pending} onChange={(event) => start(async () => {
          const result = await updateLeadAction(lead.id, { status: event.target.value as LeadStatus });
          toast(result.ok ? "Status updated" : result.error, result.ok ? "ok" : "error");
          router.refresh();
        })}>
          {STATUS_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm">{lead.summary || lead.message}</p>
      {lead.promoMessage && <p className="mt-2 text-sm text-brand">{lead.promoMessage}</p>}
      <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
        {lead.phone && <a className="text-brand" href={`tel:${lead.phone}`}>Call</a>}
        {lead.phone && <a className="text-brand" href={waLink(lead.phone, `Hi ${lead.name}, it's Harbour View Resort about ${lead.reference}.`)}>WhatsApp</a>}
        {lead.email && <a className="text-brand" href={`mailto:${lead.email}`}>Email</a>}
      </div>
      <label className="mt-3 block text-sm font-semibold" htmlFor={`notes-${lead.id}`}>Internal notes</label>
      <textarea id={`notes-${lead.id}`} className="mt-1 min-h-20 w-full rounded-input border border-line px-3 py-2" value={notes} onChange={(event) => setNotes(event.target.value)} onBlur={() => start(async () => { await updateLeadAction(lead.id, { internalNotes: notes }); router.refresh(); })} />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={pending} onClick={() => start(async () => {
          const result = await convertToCustomerAction("lead", lead.id);
          toast(result.ok ? result.message || "Created" : result.error, result.ok ? "ok" : "error");
          if (result.ok && result.id) router.push(`/admin/customers/${result.id}`);
        })}>Confirm job & open customer</Button>
        <ConfirmDialog title="Delete this lead?" body="This removes the record from the admin list." confirmLabel="Delete lead" onConfirm={() => start(async () => { await deleteLeadAction(lead.id); toast("Lead deleted"); router.refresh(); })} trigger={<Button type="button" variant="danger" size="sm">Delete</Button>} />
      </div>
    </article>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [notes, setNotes] = useState(booking.internalNotes);
  return (
    <article className="rounded-card bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold">{booking.reference} · {booking.name}</p>
          <p className="text-sm text-slate">{booking.date} · {booking.timeWindow} · {booking.suburb}</p>
        </div>
        <select className="min-h-11 rounded-input border px-3" aria-label={`Status for ${booking.reference}`} value={booking.status} disabled={pending} onChange={(event) => start(async () => {
          const result = await updateBookingAction(booking.id, { status: event.target.value as LeadStatus });
          toast(result.ok ? "Status updated" : result.error, result.ok ? "ok" : "error");
          router.refresh();
        })}>
          {STATUS_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm">{booking.summary}</p>
      <p className="mt-2 text-sm">{booking.address}</p>
      {booking.promoCode && <p className="mt-2 inline-flex rounded-full bg-leaf-soft px-3 py-1 text-sm font-semibold text-leaf-dark">Promo {booking.promoCode}: {booking.promoMessage}</p>}
      <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
        <a className="text-brand" href={`tel:${booking.phone}`}>Call</a>
        <a className="text-brand" href={waLink(booking.phone, `Hi ${booking.name}, it's Harbour View Resort about ${booking.reference}.`)}>WhatsApp</a>
      </div>
      <label className="mt-3 block text-sm font-semibold" htmlFor={`bnotes-${booking.id}`}>Internal notes</label>
      <textarea id={`bnotes-${booking.id}`} className="mt-1 min-h-20 w-full rounded-input border border-line px-3 py-2" value={notes} onChange={(event) => setNotes(event.target.value)} onBlur={() => start(async () => { await updateBookingAction(booking.id, { internalNotes: notes }); router.refresh(); })} />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={pending} onClick={() => start(async () => {
          const result = await convertToCustomerAction("booking", booking.id);
          toast(result.ok ? result.message || "Created" : result.error, result.ok ? "ok" : "error");
          if (result.ok && result.id) router.push(`/admin/customers/${result.id}`);
        })}>Confirm job & open customer</Button>
        <ConfirmDialog title="Delete this booking?" body="This removes the request. It does not email the customer." confirmLabel="Delete booking" onConfirm={() => start(async () => { await deleteBookingAction(booking.id); toast("Booking deleted"); router.refresh(); })} trigger={<Button type="button" variant="danger" size="sm">Delete</Button>} />
      </div>
    </article>
  );
}

function BlockedDates({ blocked }: { blocked: BlockedDate[] }) {
  const router = useRouter();
  const toast = useToast();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  return (
    <section className="rounded-card bg-white p-4 shadow-card">
      <h2 className="text-xl font-bold">Blocked dates</h2>
      <p className="mt-1 text-sm text-slate">Customers cannot request these days.</p>
      <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={async (event) => {
        event.preventDefault();
        const result = await saveBlockedDateAction(date, reason);
        toast(result.ok ? "Date blocked" : result.error, result.ok ? "ok" : "error");
        if (result.ok) { setDate(""); setReason(""); router.refresh(); }
      }}>
        <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} required aria-label="Date to block" />
        <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason (optional)" aria-label="Reason" />
        <Button type="submit" size="sm">Block date</Button>
      </form>
      <ul className="mt-3 space-y-2">
        {blocked.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
            <span>{item.date} {item.reason && `· ${item.reason}`}</span>
            <button type="button" className="font-semibold text-danger" onClick={async () => { await deleteBlockedDateAction(item.id); router.refresh(); }}>Remove</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
