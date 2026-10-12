"use client";

import { useState, useTransition } from "react";
import { MediaImage } from "@/components/media-image";
import { useRouter } from "next/navigation";
import {
  assignMediaAction,
  createServiceAction,
  deleteFaqAction,
  deleteMediaAction,
  deleteOfferAction,
  deletePromoAction,
  deleteResultAction,
  deleteReviewAction,
  moderateReviewAction,
  reorderAction,
  resetLocalDataAction,
  saveFaqAction,
  saveOfferAction,
  savePromoAction,
  saveResultAction,
  saveReviewAction,
  saveServiceAction,
  saveSettingsAction,
  uploadMediaAction,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/fields";
import { ServiceIcon } from "@/components/icons";
import { uploadFile } from "@/components/admin/upload";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { useToast } from "@/components/ui/toaster";
import type { Campaign, Customer, Faq, MediaItem, Offer, Promo, ResultPair, Review, Service, Settings } from "@/lib/types";
import { byOrder, formatDisplayDate, uid } from "@/lib/utils";
import { Send } from "lucide-react";
import { MessagesComposer } from "@/components/admin/messages";

function useSave() {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  function run(work: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    start(async () => {
      const result = await work();
      toast(result.ok ? result.message || "Saved" : result.error || "Could not save", result.ok ? "ok" : "error");
      if (result.ok) router.refresh();
    });
  }
  return { pending, run };
}

type SendContext = { customers: Customer[]; campaigns: Campaign[]; siteUrl: string; emailReady: boolean; smsReady: boolean };

function promoDiscount(promo: Promo) {
  return promo.type === "percent" ? `${promo.amount}% off` : `$${promo.amount} off`;
}

/** A ready-to-send message for a promo code; the admin can edit it before sending. */
function promoInvite(promo: Promo, siteUrl: string) {
  const until = promo.expiresAt ? ` until ${formatDisplayDate(promo.expiresAt)}` : "";
  return {
    title: `Promo code ${promo.code}`,
    subject: `${promoDiscount(promo)} your next clean – code ${promo.code}`,
    message: `Hi {name}, it's Harbour View Resort! Here's ${promoDiscount(promo)} your next clean with code ${promo.code}${until}. Book or get a quote: ${siteUrl}/booking`,
  };
}

export function OffersEditor({ offers, promos, send }: { offers: Offer[]; promos: Promo[]; send?: SendContext }) {
  const { pending, run } = useSave();
  const router = useRouter();
  const toast = useToast();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [promo, setPromo] = useState<Promo | null>(null);
  const [sending, setSending] = useState<Promo | null>(null);
  const [saving, startSaving] = useTransition();

  function savePromo(current: Promo) {
    const isNew = !promos.some((item) => item.id === current.id);
    startSaving(async () => {
      const result = await savePromoAction(current);
      toast(result.ok ? result.message || "Saved" : result.error || "Could not save", result.ok ? "ok" : "error");
      if (!result.ok) return;
      router.refresh();
      setPromo(null);
      // A new code goes straight to "send it to customers".
      if (isNew && send) setSending({ ...current, code: current.code.trim().toUpperCase() });
    });
  }
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => setOffer({ id: uid("offer"), title: "", description: "", bannerText: "", href: "/free-quote", image: "", active: true, startsAt: "", endsAt: "", showOnBanner: false, order: offers.length + 1 })}>New offer</Button>
      </div>
      {byOrder(offers).map((item) => (
        <article key={item.id} className="rounded-card bg-white p-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold">{item.title}</h2>
            <span className="text-sm font-semibold">{item.active ? "Active" : "Hidden"}</span>
          </div>
          <p className="mt-2 text-sm text-slate">{item.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setOffer(item)}>Edit</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("offers", item.id, -1))}>Up</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("offers", item.id, 1))}>Down</Button>
            <ConfirmDialog title="Delete offer?" body="The public site will stop showing it." confirmLabel="Delete" onConfirm={() => run(() => deleteOfferAction(item.id))} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
          </div>
        </article>
      ))}
      {offer && (
        <form className="grid gap-3 rounded-card bg-white p-4 shadow-card" onSubmit={(event) => { event.preventDefault(); run(() => saveOfferAction(offer)); }}>
          <h2 className="text-xl font-bold">Edit offer</h2>
          <Label htmlFor="offer-title">Title</Label>
          <Input id="offer-title" value={offer.title} onChange={(event) => setOffer({ ...offer, title: event.target.value })} />
          <Label htmlFor="offer-description">Description</Label>
          <Textarea id="offer-description" value={offer.description} onChange={(event) => setOffer({ ...offer, description: event.target.value })} />
          <Label htmlFor="offer-banner">Banner text</Label>
          <Input id="offer-banner" value={offer.bannerText} onChange={(event) => setOffer({ ...offer, bannerText: event.target.value })} />
          <Label htmlFor="offer-href">Link</Label>
          <Input id="offer-href" value={offer.href} onChange={(event) => setOffer({ ...offer, href: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label htmlFor="offer-start">Starts</Label><Input id="offer-start" type="date" value={offer.startsAt} onChange={(event) => setOffer({ ...offer, startsAt: event.target.value })} /></div>
            <div><Label htmlFor="offer-end">Ends</Label><Input id="offer-end" type="date" value={offer.endsAt} onChange={(event) => setOffer({ ...offer, endsAt: event.target.value })} /></div>
          </div>
          <label className="flex gap-2"><input type="checkbox" checked={offer.active} onChange={(event) => setOffer({ ...offer, active: event.target.checked })} /> Active</label>
          <label className="flex gap-2"><input type="checkbox" checked={offer.showOnBanner} onChange={(event) => setOffer({ ...offer, showOnBanner: event.target.checked })} /> Show in the top banner</label>
          <Button type="submit" disabled={pending}>Save offer</Button>
        </form>
      )}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Promo codes</h2>
          <Button type="button" size="sm" onClick={() => setPromo({ id: uid("promo"), code: "", type: "percent", amount: 10, message: "We'll confirm this discount when we call.", expiresAt: "", usageLimit: 50, usedCount: 0, active: true })}>New code</Button>
        </div>
        {promos.map((item) => (
          <article key={item.id} className="mb-3 rounded-card bg-white p-4 shadow-card">
            <p className="font-bold">{item.code} · {item.type === "percent" ? `${item.amount}%` : `$${item.amount}`} · used {item.usedCount}{item.usageLimit != null ? ` / ${item.usageLimit}` : ""}</p>
            <p className="text-sm text-slate">{item.message}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {send && item.active && <Button type="button" size="sm" onClick={() => setSending(sending?.id === item.id ? null : item)}><Send className="h-4 w-4" aria-hidden /> {sending?.id === item.id ? "Close" : "Email or text to customers"}</Button>}
              <Button type="button" size="sm" variant="outline" onClick={() => setPromo(item)}>Edit</Button>
              <ConfirmDialog title="Delete code?" body="People will no longer be able to use it." confirmLabel="Delete" onConfirm={() => run(() => deletePromoAction(item.id))} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
            </div>
          </article>
        ))}
        {send && sending && (
          <div className="mb-6 rounded-card border-2 border-brand/30 bg-brand-light/40 p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-navy">Send code {sending.code} to customers</h3>
              <Button type="button" size="sm" variant="ghost" onClick={() => setSending(null)}>Close</Button>
            </div>
            <MessagesComposer key={sending.id} compact initial={promoInvite(sending, send.siteUrl)} customers={send.customers} campaigns={send.campaigns} offers={offers} promos={promos} siteUrl={send.siteUrl} emailReady={send.emailReady} smsReady={send.smsReady} />
          </div>
        )}
        {promo && (
          <form className="grid gap-3 rounded-card bg-white p-4 shadow-card" onSubmit={(event) => { event.preventDefault(); savePromo(promo); }}>
            <Label htmlFor="promo-code">Code</Label>
            <Input id="promo-code" value={promo.code} onChange={(event) => setPromo({ ...promo, code: event.target.value.toUpperCase() })} />
            <Label htmlFor="promo-type">Type</Label>
            <select id="promo-type" className="min-h-12 rounded-input border px-3" value={promo.type} onChange={(event) => setPromo({ ...promo, type: event.target.value as Promo["type"] })}>
              <option value="percent">Percent</option>
              <option value="fixed">Fixed amount</option>
            </select>
            <Label htmlFor="promo-amount">Amount</Label>
            <Input id="promo-amount" type="number" value={promo.amount} onChange={(event) => setPromo({ ...promo, amount: Number(event.target.value) })} />
            <Label htmlFor="promo-message">Message customers see</Label>
            <Textarea id="promo-message" value={promo.message} onChange={(event) => setPromo({ ...promo, message: event.target.value })} />
            <Label htmlFor="promo-expiry">Expiry</Label>
            <Input id="promo-expiry" type="date" value={promo.expiresAt} onChange={(event) => setPromo({ ...promo, expiresAt: event.target.value })} />
            <Label htmlFor="promo-limit">Usage limit (blank for none)</Label>
            <Input id="promo-limit" value={promo.usageLimit ?? ""} onChange={(event) => setPromo({ ...promo, usageLimit: event.target.value === "" ? null : Number(event.target.value) })} />
            <label className="flex gap-2"><input type="checkbox" checked={promo.active} onChange={(event) => setPromo({ ...promo, active: event.target.checked })} /> Active</label>
            <Button type="submit" disabled={saving}>{promos.some((item) => item.id === promo.id) ? "Save code" : "Create code"}</Button>
            {send && !promos.some((item) => item.id === promo.id) && <p className="text-sm text-slate">After you create it, you can email or text it to your customers straight away.</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export function ServicesEditor({ services }: { services: Service[] }) {
  const { pending, run } = useSave();
  const [current, setCurrent] = useState<Service | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState("");
  const toast = useToast();

  async function upload(files: FileList | null, slot: string, apply: (url: string) => void) {
    if (!files?.length) return;
    setUploading(slot);
    for (const file of Array.from(files)) {
      const result = await uploadFile(file, slot);
      if (result.ok && result.url) apply(result.url);
      else toast(result.ok ? "Upload failed" : result.error, "error");
    }
    setUploading("");
  }

  return (
    <div className="space-y-6">
      <form className="flex flex-col gap-2 rounded-card bg-white p-4 shadow-card sm:flex-row" onSubmit={(event) => { event.preventDefault(); run(async () => { const result = await createServiceAction(title); if (result.ok) setTitle(""); return result; }); }}>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="New service name, e.g. Tile & grout cleaning" aria-label="New service name" />
        <Button type="submit" size="sm" className="shrink-0 whitespace-nowrap">Add service</Button>
      </form>
      {SERVICE_CATEGORIES.map((category) => {
        const list = byOrder(services).filter((service) => service.category === category.id);
        if (!list.length) return null;
        return (
          <section key={category.id}>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate">{category.title}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((service) => (
                <article key={service.id} className="flex gap-3 rounded-card bg-white p-4 shadow-card">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-light text-brand"><ServiceIcon name={service.icon} className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold text-navy">{service.title}</h3>
                      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={service.visible} onChange={(event) => run(() => saveServiceAction({ ...service, visible: event.target.checked }))} />{service.visible ? "Live" : "Hidden"}</label>
                    </div>
                    <p className="text-xs text-slate">{service.gallery.length} photos · {service.videoUrl ? "video ✓" : "no video yet"} · {service.priceFrom ? `from ${service.priceFrom}` : "no price shown"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => setCurrent(service)}>Edit</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("services", service.id, -1))}>↑</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("services", service.id, 1))}>↓</Button>
                      <a className="inline-flex min-h-10 items-center px-2 text-sm font-semibold text-brand" href={`/services/${service.slug}`} target="_blank" rel="noopener noreferrer">View</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
      {current && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-navy-deep/60 p-4" role="dialog" aria-modal="true" aria-label={`Edit ${current.title}`}>
          <form className="mx-auto grid max-w-3xl gap-4 rounded-card bg-white p-5 shadow-soft md:p-8" onSubmit={(event) => { event.preventDefault(); run(async () => { const result = await saveServiceAction(current); if (result.ok) setCurrent(null); return result; }); }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-navy">Edit {current.title}</h2>
              <button type="button" className="rounded-full px-3 py-1 font-semibold text-slate hover:bg-mist" onClick={() => setCurrent(null)}>Close</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Title</Label><Input value={current.title} onChange={(event) => setCurrent({ ...current, title: event.target.value })} /></div>
              <div>
                <Label>Category</Label>
                <Select value={current.category} onChange={(event) => setCurrent({ ...current, category: event.target.value as Service["category"] })}>
                  {SERVICE_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}
                </Select>
              </div>
              <div><Label>Price shown (optional)</Label><Input value={current.priceFrom} placeholder="e.g. $329 / night" onChange={(event) => setCurrent({ ...current, priceFrom: event.target.value })} /></div>
              <div><Label>Short detail (optional)</Label><Input value={current.duration} placeholder="e.g. Sleeps 2" onChange={(event) => setCurrent({ ...current, duration: event.target.value })} /></div>
              <div><Label>Rooms of this type (0 if not a room)</Label><Input type="number" min={0} max={500} value={current.rooms} onChange={(event) => setCurrent({ ...current, rooms: Math.max(0, Number(event.target.value) || 0) })} /></div>
              <div><Label>Sleeps up to</Label><Input type="number" min={1} max={20} value={current.maxGuests} onChange={(event) => setCurrent({ ...current, maxGuests: Math.max(1, Number(event.target.value) || 1) })} /></div>
              <div><Label>Nightly rate in $ (for totals and invoices)</Label><Input type="number" min={0} step="1" value={current.nightlyRate || ""} onChange={(event) => setCurrent({ ...current, nightlyRate: Math.max(0, Number(event.target.value) || 0) })} /></div>
            </div>
            <div><Label>Short summary</Label><Textarea className="min-h-20" value={current.summary} onChange={(event) => setCurrent({ ...current, summary: event.target.value })} /></div>
            <div><Label>Full description</Label><Textarea value={current.description} onChange={(event) => setCurrent({ ...current, description: event.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>What’s included (one per line)</Label><Textarea value={current.included.join("\n")} onChange={(event) => setCurrent({ ...current, included: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) })} /></div>
              <div><Label>Perfect for (one per line)</Label><Textarea value={current.bestFor.join("\n")} onChange={(event) => setCurrent({ ...current, bestFor: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) })} /></div>
            </div>

            <fieldset className="rounded-2xl border border-line p-4">
              <legend className="px-1 font-bold text-navy">Video</legend>
              <p className="text-sm text-slate">Paste a YouTube, TikTok, Facebook or Instagram link, or upload a short MP4 (under 4MB works best). For longer clips, post to YouTube or TikTok and paste the link.</p>
              <Input className="mt-3" value={current.videoUrl} placeholder="https://youtube.com/watch?v=…" onChange={(event) => setCurrent({ ...current, videoUrl: event.target.value })} />
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <label className="inline-flex min-h-10 cursor-pointer items-center rounded-full bg-brand-light px-4 text-sm font-semibold text-brand">
                  {uploading === `service-video:${current.slug}` ? "Uploading…" : "Upload video"}
                  <input type="file" accept="video/mp4,video/webm" className="sr-only" onChange={(event) => upload(event.target.files, `service-video:${current.slug}`, (url) => setCurrent((item) => (item ? { ...item, videoUrl: url } : item)))} />
                </label>
                {current.videoUrl && <button type="button" className="text-sm font-semibold text-danger" onClick={() => setCurrent({ ...current, videoUrl: "" })}>Remove video</button>}
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-line p-4">
              <legend className="px-1 font-bold text-navy">Photos</legend>
              <p className="text-sm text-slate">The cover photo shows on the service card and as the video poster. Gallery photos appear on the service page.</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {current.image && <MediaImage src={current.image} alt="" className="h-20 w-28 rounded-xl object-cover" />}
                <label className="inline-flex min-h-10 cursor-pointer items-center rounded-full bg-brand-light px-4 text-sm font-semibold text-brand">
                  {uploading === `service-image:${current.slug}` ? "Uploading…" : current.image ? "Replace cover photo" : "Upload cover photo"}
                  <input type="file" accept="image/*" className="sr-only" onChange={(event) => upload(event.target.files, `service-image:${current.slug}`, (url) => setCurrent((item) => (item ? { ...item, image: url } : item)))} />
                </label>
              </div>
              <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {current.gallery.map((url, index) => (
                  <li key={url} className="group relative">
                    <MediaImage src={url} alt="" className="aspect-square w-full rounded-xl object-cover" />
                    <button type="button" className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-sm font-bold text-danger shadow" aria-label={`Remove photo ${index + 1}`} onClick={() => setCurrent({ ...current, gallery: current.gallery.filter((item) => item !== url) })}>×</button>
                  </li>
                ))}
                <li>
                  <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line text-center text-xs font-semibold text-brand hover:border-brand">
                    {uploading === `service-gallery:${current.slug}` ? "Uploading…" : "+ Add photos"}
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => upload(event.target.files, `service-gallery:${current.slug}`, (url) => setCurrent((item) => (item ? { ...item, gallery: [...item.gallery, url] } : item)))} />
                  </label>
                </li>
              </ul>
            </fieldset>

            <div className="sticky bottom-0 -mx-5 flex gap-3 border-t border-line bg-white px-5 pt-4 md:-mx-8 md:px-8">
              <Button type="submit" disabled={pending || Boolean(uploading)}>{pending ? "Saving…" : "Save service"}</Button>
              <Button type="button" variant="ghost" onClick={() => setCurrent(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function ResultsEditor({ results, services }: { results: ResultPair[]; services: Service[] }) {
  const { pending, run } = useSave();
  const [current, setCurrent] = useState<ResultPair>({ id: uid("ba"), serviceSlug: services[0]?.slug || "carpet-cleaning", caption: "", scene: "carpet", beforeImage: "", afterImage: "", illustrative: true, order: results.length + 1 });
  async function fileToData(file: File) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1400 / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
    if (!blob) return "";
    const data = new FormData();
    data.set("file", new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
    data.set("slot", "gallery");
    const uploaded = await uploadMediaAction(data);
    return uploaded.ok ? uploaded.url || "" : "";
  }
  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-card bg-white p-4 shadow-card" onSubmit={(event) => { event.preventDefault(); run(() => saveResultAction(current)); }}>
        <h2 className="text-xl font-bold">Add or replace a pair</h2>
        <Label htmlFor="result-service">Service</Label>
        <select id="result-service" className="min-h-12 rounded-input border px-3" value={current.serviceSlug} onChange={(event) => setCurrent({ ...current, serviceSlug: event.target.value, scene: event.target.value })}>
          {services.map((service) => <option key={service.id} value={service.slug}>{service.title}</option>)}
        </select>
        <Label htmlFor="result-caption">Caption</Label>
        <Input id="result-caption" value={current.caption} onChange={(event) => setCurrent({ ...current, caption: event.target.value })} />
        <Label htmlFor="result-before">Before photo</Label>
        <Input id="result-before" type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const url = await fileToData(file); if (url) setCurrent((item) => ({ ...item, beforeImage: url })); }} />
        <Label htmlFor="result-after">After photo</Label>
        <Input id="result-after" type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const url = await fileToData(file); if (url) setCurrent((item) => ({ ...item, afterImage: url })); }} />
        <label className="flex gap-2"><input type="checkbox" checked={current.illustrative} onChange={(event) => setCurrent({ ...current, illustrative: event.target.checked })} /> Mark as illustrative</label>
        <Button type="submit" disabled={pending}>Save pair</Button>
      </form>
      {byOrder(results).map((item) => (
        <article key={item.id} className="rounded-card bg-white p-4 shadow-card">
          <p className="font-bold">{item.caption || item.serviceSlug}</p>
          <p className="text-sm text-slate">{item.illustrative ? "Illustrative" : "Real job photo"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("results", item.id, -1))}>Up</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("results", item.id, 1))}>Down</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setCurrent(item)}>Edit</Button>
            <ConfirmDialog title="Delete this pair?" body="The public gallery will no longer show it." confirmLabel="Delete" onConfirm={() => run(() => deleteResultAction(item.id))} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function MediaEditor({ media, services }: { media: MediaItem[]; services: Service[] }) {
  const { run } = useSave();
  const [slot, setSlot] = useState("gallery");
  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-card bg-white p-4 shadow-card" onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        data.set("slot", slot);
        run(() => uploadMediaAction(data));
        event.currentTarget.reset();
      }}>
        <Label htmlFor="media-file">Upload</Label>
        <Input id="media-file" name="file" type="file" accept="image/*,video/mp4,video/webm" required />
        <Label htmlFor="media-slot">Use it as</Label>
        <select id="media-slot" className="min-h-12 rounded-input border px-3" value={slot} onChange={(event) => setSlot(event.target.value)}>
          <option value="gallery">Gallery only</option>
          <option value="hero-image">Hero image</option>
          <option value="hero-video">Hero video</option>
          <option value="team-photo">Team photo</option>
          <option value="og-image">Social share image</option>
          {services.map((service) => <option key={service.id} value={`service-video:${service.slug}`}>{service.title} video</option>)}
          {services.map((service) => <option key={`${service.id}-image`} value={`service-image:${service.slug}`}>{service.title} cover photo</option>)}
          {services.map((service) => <option key={`${service.id}-gallery`} value={`service-gallery:${service.slug}`}>{service.title} gallery</option>)}
        </select>
        <Button type="submit">Upload</Button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2">
        {media.map((item) => (
          <article key={item.id} className="rounded-card bg-white p-4 shadow-card">
            {item.kind === "image" ? <MediaImage src={item.url} alt="" className="aspect-video w-full rounded-2xl object-cover" /> : <video src={item.url} className="aspect-video w-full rounded-2xl" controls />}
            <p className="mt-2 text-sm font-semibold">{item.name}</p>
            <p className="text-sm text-slate">{item.slot || "gallery"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => run(() => assignMediaAction(item.url, slot))}>Assign selected use</Button>
              <ConfirmDialog title="Remove from the library?" body="The file may still exist in storage, but the site will stop listing it." confirmLabel="Remove" onConfirm={() => run(() => deleteMediaAction(item.id))} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ReviewsEditor({ reviews, googleUrl }: { reviews: Review[]; googleUrl: string }) {
  const { pending, run } = useSave();
  const blank = (): Review => ({ id: uid("rev"), name: "", text: "", service: "", rating: 5, date: new Date().toISOString().slice(0, 10), source: "manual", status: "approved", email: "", suburb: "", order: reviews.length + 1 });
  const [current, setCurrent] = useState<Review | null>(null);
  const [tab, setTab] = useState<Review["status"]>(reviews.some((review) => review.status === "pending") ? "pending" : "approved");
  const counts = { pending: 0, approved: 0, rejected: 0 } as Record<Review["status"], number>;
  reviews.forEach((review) => { counts[review.status] += 1; });
  const list = byOrder(reviews).filter((review) => review.status === tab);
  return (
    <div className="space-y-5">
      <div className="rounded-card bg-white p-4 shadow-card">
        <p className="text-sm text-slate">Reviews customers send from the website land in <strong>Pending</strong>. Nothing appears on the site until you approve it.</p>
        <p className="mt-1 text-sm text-slate">Google review link: {googleUrl ? <a className="font-semibold text-brand underline" href={googleUrl} target="_blank" rel="noopener noreferrer">{googleUrl}</a> : <span>not set yet. Add it in <a className="font-semibold text-brand underline" href="/admin/settings">Settings</a> once your Google Business profile is live.</span>}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {(["pending", "approved", "rejected"] as const).map((status) => (
          <button key={status} type="button" onClick={() => setTab(status)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold capitalize ${tab === status ? "bg-navy text-white" : "bg-white text-navy shadow-card"}`}>
            {status}
            <span className={`rounded-full px-2 text-xs ${status === "pending" && counts.pending ? "bg-sun text-navy" : tab === status ? "bg-white/20" : "bg-mist"}`}>{counts[status]}</span>
          </button>
        ))}
        <Button type="button" size="sm" variant="outline" className="ml-auto" onClick={() => setCurrent(blank())}>Add a review manually</Button>
      </div>
      {list.length === 0 && <p className="rounded-card bg-white p-6 text-slate shadow-card">{tab === "pending" ? "No reviews waiting. You’re all caught up!" : `No ${tab} reviews.`}</p>}
      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((review) => (
          <article key={review.id} className="rounded-card bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-navy">{review.name}</p>
              <span className="text-sun" aria-label={`${review.rating} stars`}>{"★".repeat(review.rating)}<span className="text-line">{"★".repeat(5 - review.rating)}</span></span>
            </div>
            <p className="text-xs text-slate">{[review.service, review.suburb, review.date, review.source === "customer" ? "sent from website" : review.source, review.email].filter(Boolean).join(" · ")}</p>
            <p className="mt-3 text-[15px]">{review.text}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {review.status !== "approved" && <Button type="button" size="sm" variant="accent" disabled={pending} onClick={() => run(() => moderateReviewAction(review.id, "approved"))}>Approve & publish</Button>}
              {review.status !== "rejected" && <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => run(() => moderateReviewAction(review.id, "rejected"))}>{review.status === "approved" ? "Unpublish" : "Reject"}</Button>}
              <Button type="button" size="sm" variant="ghost" onClick={() => setCurrent(review)}>Edit</Button>
              {review.status === "approved" && <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("reviews", review.id, -1))}>Move up</Button>}
              <ConfirmDialog title="Delete review?" body="This removes it permanently." confirmLabel="Delete" onConfirm={() => run(() => deleteReviewAction(review.id))} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
            </div>
          </article>
        ))}
      </div>
      {current && (
        <form className="grid gap-3 rounded-card bg-white p-5 shadow-card" onSubmit={(event) => { event.preventDefault(); run(async () => { const result = await saveReviewAction(current); if (result.ok) setCurrent(null); return result; }); }}>
          <h2 className="text-xl font-bold text-navy">{reviews.some((item) => item.id === current.id) ? "Edit review" : "Add a review"}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><Label htmlFor="review-name">Name</Label><Input id="review-name" value={current.name} onChange={(event) => setCurrent({ ...current, name: event.target.value })} /></div>
            <div><Label htmlFor="review-service">Service</Label><Input id="review-service" value={current.service} onChange={(event) => setCurrent({ ...current, service: event.target.value })} /></div>
            <div><Label htmlFor="review-rating">Stars</Label><Input id="review-rating" type="number" min={1} max={5} value={current.rating} onChange={(event) => setCurrent({ ...current, rating: Number(event.target.value) })} /></div>
          </div>
          <Label htmlFor="review-text">Review</Label>
          <Textarea id="review-text" value={current.text} onChange={(event) => setCurrent({ ...current, text: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="review-source">Where it came from</Label>
              <Select id="review-source" value={current.source} onChange={(event) => setCurrent({ ...current, source: event.target.value as Review["source"] })}>
                <option value="manual">Added by me</option>
                <option value="google">Copied from Google</option>
                <option value="customer">Sent from website</option>
                <option value="sample">Sample (placeholder)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="review-status">Status</Label>
              <Select id="review-status" value={current.status} onChange={(event) => setCurrent({ ...current, status: event.target.value as Review["status"] })}>
                <option value="approved">Approved (on website)</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
          </div>
          <div className="flex gap-2"><Button type="submit" disabled={pending}>Save review</Button><Button type="button" variant="ghost" onClick={() => setCurrent(null)}>Cancel</Button></div>
        </form>
      )}
    </div>
  );
}

export function FaqsEditor({ faqs }: { faqs: Faq[] }) {
  const { pending, run } = useSave();
  const [current, setCurrent] = useState<Faq>({ id: uid("faq"), category: "Booking", question: "", answer: "", order: faqs.length + 1 });
  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-card bg-white p-4 shadow-card" onSubmit={(event) => { event.preventDefault(); run(() => saveFaqAction(current)); }}>
        <Label htmlFor="faq-category">Category</Label>
        <Input id="faq-category" value={current.category} onChange={(event) => setCurrent({ ...current, category: event.target.value })} />
        <Label htmlFor="faq-question">Question</Label>
        <Input id="faq-question" value={current.question} onChange={(event) => setCurrent({ ...current, question: event.target.value })} />
        <Label htmlFor="faq-answer">Answer</Label>
        <Textarea id="faq-answer" value={current.answer} onChange={(event) => setCurrent({ ...current, answer: event.target.value })} />
        <Button type="submit" disabled={pending}>Save FAQ</Button>
      </form>
      {byOrder(faqs).map((faq) => (
        <article key={faq.id} className="rounded-card bg-white p-4 shadow-card">
          <p className="text-sm font-semibold text-brand">{faq.category}</p>
          <h2 className="font-bold">{faq.question}</h2>
          <div className="mt-2 flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setCurrent(faq)}>Edit</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("faqs", faq.id, -1))}>Up</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => run(() => reorderAction("faqs", faq.id, 1))}>Down</Button>
            <ConfirmDialog title="Delete FAQ?" body="It will leave the public FAQ page." confirmLabel="Delete" onConfirm={() => run(() => deleteFaqAction(faq.id))} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function SettingsEditor({ settings, localMode }: { settings: Settings; localMode: boolean }) {
  const { pending, run } = useSave();
  const [current, setCurrent] = useState(settings);
  const set = (patch: Partial<Settings>) => setCurrent((value) => ({ ...value, ...patch }));
  return (
    <form className="grid gap-6" onSubmit={(event) => { event.preventDefault(); run(() => saveSettingsAction(current)); }}>
      <Group title="Business & contact" note="These show across the website, in the chat and in emails.">
        <Field label="Business name" value={current.businessName} onChange={(value) => set({ businessName: value })} />
        <Field label="Short name" value={current.shortName} onChange={(value) => set({ shortName: value })} />
        <Field label="Phone (as shown)" value={current.phoneDisplay} placeholder="0401 647 545" onChange={(value) => set({ phoneDisplay: value, phoneTel: toTel(value) || current.phoneTel })} />
        <Field label="Phone for call links" value={current.phoneTel} placeholder="+61401647545" onChange={(value) => set({ phoneTel: value })} />
        <Field label="Public email" value={current.email} note="This is also the admin sign-in email." onChange={(value) => set({ email: value })} />
        <Field label="Where new leads are emailed" value={current.notificationEmail} onChange={(value) => set({ notificationEmail: value })} />
        <Field label="Address (optional)" value={current.address} onChange={(value) => set({ address: value })} />
        <Field label="WhatsApp link (optional)" value={current.whatsappUrl} placeholder="Leave blank to use the phone number" onChange={(value) => set({ whatsappUrl: value })} />
      </Group>

      <Group title="Social media & Google" note="Paste the full link to each profile. Icons stay on the site and open the network’s home page until a link is added.">
        <Field label="Facebook page" value={current.facebook} placeholder="https://facebook.com/…" onChange={(value) => set({ facebook: value })} />
        <Field label="Instagram" value={current.instagram} placeholder="https://instagram.com/…" onChange={(value) => set({ instagram: value })} />
        <Field label="TikTok" value={current.tiktok} placeholder="https://tiktok.com/@…" onChange={(value) => set({ tiktok: value })} />
        <Field label="YouTube (optional)" value={current.youtube} placeholder="https://youtube.com/@…" onChange={(value) => set({ youtube: value })} />
        <Field label="Google review link" value={current.google} placeholder="https://g.page/r/…/review" note="From Google Business Profile → Ask for reviews. Used by every “Review us on Google” button." onChange={(value) => set({ google: value })} />
      </Group>

      <Group title="Homepage">
        <Field label="Hero headline" value={current.heroHeadline} onChange={(value) => set({ heroHeadline: value })} />
        <label className="block text-sm font-semibold text-navy sm:col-span-2">Hero text<Textarea className="mt-1 font-normal" value={current.heroSubtext} onChange={(event) => set({ heroSubtext: event.target.value })} /></label>
        <p className="text-sm text-slate sm:col-span-2">Upload a hero photo or team photo in <a href="/admin/media" className="font-semibold text-brand underline">Gallery & media</a>.</p>
      </Group>

      <Group title="Service areas">
        <label className="block text-sm font-semibold text-navy sm:col-span-2">One suburb per line
          <Textarea className="mt-1 min-h-48 font-normal" value={current.serviceAreas.join("\n")} onChange={(event) => set({ serviceAreas: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) })} />
        </label>
      </Group>

      <Group title="Bookings" note="How many jobs can happen in the same time slot. Keep 1 for one crew; set 2 if two crews work at once.">
        <label className="block text-sm font-semibold text-navy" htmlFor="slot-capacity">Jobs per time slot
          <Input id="slot-capacity" type="number" min={1} max={20} className="mt-1 font-normal" value={current.slotCapacity} onChange={(event) => set({ slotCapacity: Math.max(1, Number(event.target.value) || 1) })} />
        </label>
      </Group>

      <Group title="Invoices" note="Shown on every invoice. Prices you type on invoices are what the customer pays.">
        <label className="flex items-start gap-3 text-sm font-semibold text-navy">
          <input type="checkbox" className="mt-1 h-5 w-5" checked={current.invoice.gstRegistered} onChange={(event) => set({ invoice: { ...current.invoice, gstRegistered: event.target.checked } })} />
          <span>Registered for GST<span className="block font-normal text-slate">Invoices become “Tax invoice” and show the GST included (1/11 of the total). Needs your ABN above.</span></span>
        </label>
        <label className="block text-sm font-semibold text-navy" htmlFor="inv-terms">Days to pay
          <Input id="inv-terms" type="number" min={0} max={120} className="mt-1 font-normal" value={current.invoice.termsDays} onChange={(event) => set({ invoice: { ...current.invoice, termsDays: Math.max(0, Number(event.target.value) || 0) } })} />
        </label>
        <label className="block text-sm font-semibold text-navy" htmlFor="inv-account-name">Bank account name
          <Input id="inv-account-name" className="mt-1 font-normal" value={current.invoice.bankAccountName} onChange={(event) => set({ invoice: { ...current.invoice, bankAccountName: event.target.value } })} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-navy" htmlFor="inv-bsb">BSB
            <Input id="inv-bsb" inputMode="numeric" placeholder="062-000" className="mt-1 font-normal" value={current.invoice.bsb} onChange={(event) => set({ invoice: { ...current.invoice, bsb: event.target.value } })} />
          </label>
          <label className="block text-sm font-semibold text-navy" htmlFor="inv-account">Account number
            <Input id="inv-account" inputMode="numeric" className="mt-1 font-normal" value={current.invoice.accountNumber} onChange={(event) => set({ invoice: { ...current.invoice, accountNumber: event.target.value } })} />
          </label>
        </div>
        <label className="block text-sm font-semibold text-navy" htmlFor="inv-footer">Thank-you line at the bottom
          <Input id="inv-footer" className="mt-1 font-normal" value={current.invoice.footer} onChange={(event) => set({ invoice: { ...current.invoice, footer: event.target.value } })} />
        </label>
      </Group>

      <Group title="Opening hours">
        {current.openingHours.map((hour, index) => (
          <label key={hour.day} className="grid gap-1 text-sm font-semibold text-navy sm:grid-cols-[120px_1fr] sm:items-center">{hour.day}
            <Input value={hour.hours} onChange={(event) => set({ openingHours: current.openingHours.map((item, itemIndex) => (itemIndex === index ? { ...item, hours: event.target.value } : item)) })} />
          </label>
        ))}
      </Group>

      <Group title="Business details (optional)">
        <Field label="ABN" value={current.abn} onChange={(value) => set({ abn: value })} />
        <Field label="Licence" value={current.licence} onChange={(value) => set({ licence: value })} />
        <Field label="Insurance" value={current.insurance} onChange={(value) => set({ insurance: value })} />
        <p className="text-sm text-slate sm:col-span-2">Trust numbers (e.g. “500+ homes cleaned”) only show when you fill them in. Please use real figures.</p>
        {[0, 1, 2].map((index) => (
          <div key={index} className="grid grid-cols-2 gap-2 sm:col-span-2">
            <Input placeholder="Number, e.g. 500+" aria-label={`Stat ${index + 1} value`} value={current.stats[index]?.value || ""} onChange={(event) => { const stats = [...current.stats]; stats[index] = { value: event.target.value, label: stats[index]?.label || "" }; set({ stats }); }} />
            <Input placeholder="Label, e.g. homes cleaned" aria-label={`Stat ${index + 1} label`} value={current.stats[index]?.label || ""} onChange={(event) => { const stats = [...current.stats]; stats[index] = { value: stats[index]?.value || "", label: event.target.value }; set({ stats }); }} />
          </div>
        ))}
      </Group>

      <Group title="Search engines (SEO)">
        <Field label="Page title" value={current.seoTitle} onChange={(value) => set({ seoTitle: value })} />
        <label className="block text-sm font-semibold text-navy sm:col-span-2">Description<Textarea className="mt-1 min-h-20 font-normal" value={current.seoDescription} onChange={(event) => set({ seoDescription: event.target.value })} /></label>
      </Group>

      <div className="sticky bottom-0 flex flex-wrap gap-3 rounded-card bg-white p-4 shadow-soft">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save settings"}</Button>
        {localMode && <ConfirmDialog title="Restore starter content?" body="This puts the original services, FAQs and sample reviews back and clears local leads." confirmLabel="Restore" onConfirm={() => run(() => resetLocalDataAction())} trigger={<Button type="button" variant="danger">Restore starter content</Button>} />}
      </div>
    </form>
  );
}

function toTel(display: string) {
  const digits = display.replace(/\D/g, "");
  if (/^0\d{9}$/.test(digits)) return `+61${digits.slice(1)}`;
  return "";
}

function Group({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-card bg-white p-5 shadow-card md:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="text-xl font-bold text-navy">{title}</h2>
      {note && <p className="mt-1 text-sm text-slate">{note}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({ label, value, onChange, placeholder, note }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; note?: string }) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <label className="block text-sm font-semibold text-navy" htmlFor={id}>
      {label}
      <Input id={id} className="mt-1 font-normal" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      {note && <span className="mt-1 block text-xs font-normal text-slate">{note}</span>}
    </label>
  );
}
