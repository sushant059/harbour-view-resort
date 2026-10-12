"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Mail, MessageCircle, Search, Send, Smartphone } from "lucide-react";
import { logCampaignAction, sendOfferAction, setOfferConsentAction } from "@/lib/actions";
import { displayName } from "@/components/admin/customers";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toaster";
import type { Campaign, Customer, Offer, Promo } from "@/lib/types";
import { cn, formatDisplayDateTime, waLink } from "@/lib/utils";

type Channel = "email" | "sms" | "whatsapp";

const CHANNELS: { id: Channel; label: string; icon: typeof Mail }[] = [
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "Text message", icon: Smartphone },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
];

const CHANNEL_LABEL: Record<Campaign["channel"], string> = { email: "Email", sms: "Text", whatsapp: "WhatsApp" };

function personalise(message: string, customer: Customer) {
  return message.replace(/\{name\}/gi, customer.name.trim().split(/\s+/)[0] || "there");
}

function smsLink(phone: string, text: string) {
  return `sms:${phone}?&body=${encodeURIComponent(text)}`;
}

function contactFor(customer: Customer, channel: Channel) {
  return channel === "email" ? customer.email : customer.phone;
}

export function MessagesComposer({ customers, offers, promos, campaigns, siteUrl, emailReady, smsReady, initial, compact = false }: { customers: Customer[]; offers: Offer[]; promos: Promo[]; campaigns: Campaign[]; siteUrl: string; emailReady: boolean; smsReady: boolean; initial?: { title: string; subject: string; message: string }; compact?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [message, setMessage] = useState(initial?.message ?? "Hi {name}, it's Harbour View Resort! ");
  const [channel, setChannel] = useState<Channel>("email");
  const [selected, setSelected] = useState<string[]>([]);
  const [opened, setOpened] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const activePromos = promos.filter((promo) => promo.active);

  const sorted = useMemo(() => [...customers].sort((a, b) => displayName(a).localeCompare(displayName(b))), [customers]);
  const visible = sorted.filter((customer) => {
    const q = query.trim().toLowerCase();
    return !q || [customer.name, customer.companyName, customer.phone, customer.email, customer.suburb].join(" ").toLowerCase().includes(q);
  });
  // Who can get this message: agreed to offers, and has an email or phone for the chosen channel.
  const canSend = (customer: Customer) => customer.marketingOptIn && Boolean(contactFor(customer, channel));
  const sendable = sorted.filter(canSend);
  const recipients = sendable.filter((customer) => selected.includes(customer.id));
  const automatic = (channel === "email" && emailReady) || (channel === "sms" && smsReady);

  function applyOffer(id: string) {
    const offer = offers.find((item) => item.id === id);
    if (!offer) return;
    setTitle(offer.title);
    setSubject(offer.title);
    setMessage(`Hi {name}, it's Harbour View Resort! ${offer.title}. ${offer.description} Book or get a quote: ${siteUrl}${offer.href || "/free-quote"}`);
  }

  function addPromo(code: string) {
    const promo = promos.find((item) => item.code === code);
    if (promo) setMessage((value) => `${value.trimEnd()}\nUse code ${promo.code} for ${promo.type === "percent" ? `${promo.amount}% off` : `$${promo.amount} off`}.`);
  }

  function toggle(id: string, on: boolean) {
    setSelected((value) => (on ? [...new Set([...value, id])] : value.filter((item) => item !== id)));
  }

  function consent(customer: Customer, agreed: boolean) {
    start(async () => {
      const result = await setOfferConsentAction(customer.id, agreed);
      toast(result.ok ? `${displayName(customer)}: ${result.message}` : result.error, result.ok ? "ok" : "error");
      if (!agreed) toggle(customer.id, false);
      router.refresh();
    });
  }

  function sendNow() {
    if (channel === "whatsapp") return;
    start(async () => {
      const result = await sendOfferAction({ title, subject, message, channel, recipientIds: recipients.map((item) => item.id) });
      toast(result.ok ? result.message || "Sent" : result.error, result.ok ? "ok" : "error");
      if (result.ok) {
        setSelected((value) => value.filter((id) => !result.sentIds?.includes(id)));
        router.refresh();
      }
    });
  }

  function saveHistory() {
    start(async () => {
      const result = await logCampaignAction({ title: title || subject, message, channel, recipientIds: opened });
      toast(result.ok ? result.message || "Saved" : result.error, result.ok ? "ok" : "error");
      if (result.ok) {
        setOpened([]);
        setSelected([]);
        router.refresh();
      }
    });
  }

  const optOut = channel === "email" ? "Each email ends with an unsubscribe line." : "“Reply STOP to opt out” is added to texts if it’s missing.";
  const mailtoAll = `mailto:?bcc=${encodeURIComponent(recipients.map((item) => item.email).join(","))}&subject=${encodeURIComponent(subject || title)}&body=${encodeURIComponent(message.replace(/\{name\}/gi, "there"))}`;

  return (
    <div className="space-y-6">
      <section className="rounded-card bg-white p-4 shadow-card sm:p-5">
        <h2 className="text-xl font-bold text-navy">1. How do you want to send it?</h2>
        <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Send with">
          {CHANNELS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" role="radio" aria-checked={channel === id} onClick={() => { setChannel(id); setOpened([]); }} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-sm font-semibold sm:flex-row sm:gap-2", channel === id ? "bg-navy text-white" : "bg-mist text-navy")}>
              <Icon className="h-5 w-5" aria-hidden /> {label}
            </button>
          ))}
        </div>
        <p className="mt-3 rounded-2xl bg-mist p-3 text-sm text-slate">
          {channel === "email" && (emailReady ? "Emails are sent straight from the website, one to each person, from your business Gmail." : "Email sending isn’t switched on yet, so the button opens your email app with everyone in BCC. To send straight from the website, add GMAIL_USER and GMAIL_APP_PASSWORD in Vercel (see README).")}
          {channel === "sms" && (smsReady ? "Texts are sent straight from the website through ClickSend (about 8–9c each)." : "Automatic texting isn’t switched on yet, so each button opens your phone’s Messages app with the text ready. To send to everyone in one click, add a ClickSend account in Vercel (see README).")}
          {channel === "whatsapp" && "Each button opens WhatsApp with the message ready. Tap send there, then come back for the next one. WhatsApp doesn’t allow bulk sending without a paid Business API account."}
        </p>
      </section>

      <section className="rounded-card bg-white p-4 shadow-card sm:p-5">
        <h2 className="text-xl font-bold text-navy">2. Write the message</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {!compact && <>
          <div>
            <Label htmlFor="m-offer">Start from an offer (optional)</Label>
            <Select id="m-offer" defaultValue="" onChange={(event) => applyOffer(event.target.value)}>
              <option value="">Choose an offer…</option>
              {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.title}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="m-promo">Add a promo code (optional)</Label>
            <Select id="m-promo" defaultValue="" onChange={(event) => { addPromo(event.target.value); event.target.value = ""; }}>
              <option value="">Choose a code…</option>
              {activePromos.map((promo) => <option key={promo.id} value={promo.code}>{promo.code}</option>)}
            </Select>
          </div>
          </>}
          {channel === "email" ? (
            <div className="sm:col-span-2"><Label htmlFor="m-subject">Email subject</Label><Input id="m-subject" value={subject} placeholder="e.g. 20% off carpet cleaning this month" onChange={(event) => setSubject(event.target.value)} /></div>
          ) : (
            <div className="sm:col-span-2"><Label htmlFor="m-title">Name for your records</Label><Input id="m-title" value={title} placeholder="e.g. Wet season carpet special" onChange={(event) => setTitle(event.target.value)} /></div>
          )}
        </div>
        <Label htmlFor="m-message" className="mt-4">Message <span className="font-normal text-slate">({"{name}"} becomes each customer’s first name)</span></Label>
        <Textarea id="m-message" className="min-h-36" value={message} onChange={(event) => setMessage(event.target.value)} />
        <p className="mt-1 text-xs text-slate">{optOut} {channel === "sms" && `${message.length} characters (one text is 160).`}</p>
      </section>

      <section className="rounded-card bg-white p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-navy">3. Choose customers</h2>
          {sendable.length > 0 && (
            <Button type="button" size="sm" variant="outline" onClick={() => setSelected(recipients.length === sendable.length ? [] : sendable.map((item) => item.id))}>
              {recipients.length === sendable.length ? "Clear all" : `Select all who can get it (${sendable.length})`}
            </Button>
          )}
        </div>
        <p className="mt-1 text-sm text-slate">All your customers are listed. Australian law (Spam Act) only allows offers to people who agreed to get them, so tap <strong>“They agreed”</strong> once a customer says yes.</p>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" aria-hidden />
          <Input aria-label="Search customers" className="pl-9" placeholder="Search name, phone, email or suburb" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <ul className="mt-3 grid gap-2 lg:grid-cols-2">
          {visible.map((customer) => {
            const contact = contactFor(customer, channel);
            const ready = canSend(customer);
            return (
              <li key={customer.id} className={cn("rounded-2xl border p-3", selected.includes(customer.id) && ready ? "border-brand bg-brand-light" : "border-line")}>
                <div className="flex items-start gap-3">
                  <input aria-label={`Send to ${displayName(customer)}`} type="checkbox" className="mt-1 h-5 w-5 shrink-0" disabled={!ready} checked={ready && selected.includes(customer.id)} onChange={(event) => toggle(customer.id, event.target.checked)} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy">{displayName(customer)}</p>
                    <p className="break-all text-sm text-slate">{[customer.phone, customer.email].filter(Boolean).join(" · ") || "No contact details"}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                      {customer.marketingOptIn ? (
                        <span className="rounded-full bg-leaf-soft px-2 py-1 text-leaf-dark">Agreed to offers</span>
                      ) : (
                        <button type="button" disabled={pending} onClick={() => consent(customer, true)} className="rounded-full bg-sun-soft px-3 py-1.5 text-[#8A5A00] hover:bg-sun/40">They agreed – allow offers</button>
                      )}
                      {!contact && <span className="rounded-full bg-mist px-2 py-1 text-slate">No {channel === "email" ? "email" : "phone"} saved</span>}
                      {customer.marketingOptIn && <button type="button" disabled={pending} onClick={() => consent(customer, false)} className="text-slate underline">Stop offers</button>}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {customers.length === 0 && <p className="mt-3 rounded-2xl bg-mist p-4 text-sm text-slate">No customers yet. They’re added automatically from website bookings, or in Guests & stays.</p>}
      </section>

      {recipients.length > 0 && (
        <section className="rounded-card bg-white p-4 shadow-card sm:p-5">
          <h2 className="text-xl font-bold text-navy">4. Send to {recipients.length} {recipients.length === 1 ? "customer" : "customers"}</h2>
          {automatic ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button type="button" disabled={pending} onClick={sendNow}><Send className="h-4 w-4" aria-hidden /> {pending ? "Sending…" : `Send ${channel === "email" ? "emails" : "texts"} now`}</Button>
              <span className="text-sm text-slate">Each person gets their own {channel === "email" ? "email" : "text"} with their name.</span>
            </div>
          ) : (
            <>
              {channel === "email" && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a href={mailtoAll} onClick={() => setOpened(recipients.map((item) => item.id))} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 text-sm font-bold text-white"><Mail className="h-4 w-4" aria-hidden /> Open email app (everyone in BCC)</a>
                  <span className="text-sm text-slate">{"{name}"} becomes “there” in a group email. Or send one by one below.</span>
                </div>
              )}
              <ul className="mt-4 divide-y divide-line">
                {recipients.map((customer) => {
                  const text = personalise(message, customer);
                  const href = channel === "whatsapp" ? waLink(customer.phone, text) : channel === "sms" ? smsLink(customer.phone, text.includes("STOP") ? text : `${text}\nReply STOP to opt out.`) : `mailto:${customer.email}?subject=${encodeURIComponent(subject || title)}&body=${encodeURIComponent(text)}`;
                  const done = opened.includes(customer.id);
                  return (
                    <li key={customer.id} className="flex flex-wrap items-center gap-3 py-3">
                      <span className="min-w-0 flex-1"><span className="block font-semibold text-navy">{displayName(customer)}</span><span className="block truncate text-sm text-slate">{text.split("\n")[0]}</span></span>
                      <a href={href} target={channel === "whatsapp" ? "_blank" : undefined} rel="noopener noreferrer" onClick={() => setOpened((value) => (value.includes(customer.id) ? value : [...value, customer.id]))} className={cn("inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold", done ? "bg-leaf-soft text-leaf-dark" : channel === "whatsapp" ? "bg-whatsapp text-white" : "bg-navy text-white")}>
                        {done ? <><Check className="h-4 w-4" aria-hidden /> Opened</> : channel === "whatsapp" ? "Send on WhatsApp" : channel === "sms" ? "Send text" : "Send email"}
                      </a>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button type="button" disabled={pending || opened.length === 0} onClick={saveHistory}>Save to history ({opened.length} sent)</Button>
                <span className="text-sm text-slate">Records who you sent this to.</span>
              </div>
            </>
          )}
        </section>
      )}

      {!compact && <section className="rounded-card bg-white p-4 shadow-card sm:p-5">
        <h2 className="text-xl font-bold text-navy">Message history</h2>
        {campaigns.length === 0 && <p className="mt-2 text-sm text-slate">Nothing sent yet.</p>}
        <ul className="mt-3 divide-y divide-line">
          {campaigns.map((campaign) => (
            <li key={campaign.id} className="py-3">
              <p className="font-semibold text-navy">{campaign.title} <span className="text-sm font-normal text-slate">· {CHANNEL_LABEL[campaign.channel]} · {campaign.recipientIds.length} people · {formatDisplayDateTime(campaign.createdAt)}</span></p>
              <p className="whitespace-pre-wrap text-sm text-slate">{campaign.message}</p>
              <p className="mt-1 text-xs text-slate">To: {campaign.recipientIds.map((id) => customers.find((item) => item.id === id)).filter(Boolean).map((item) => displayName(item as Customer)).join(", ") || "—"}</p>
            </li>
          ))}
        </ul>
      </section>}
    </div>
  );
}
