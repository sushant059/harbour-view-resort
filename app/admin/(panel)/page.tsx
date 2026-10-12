import Link from "next/link";
import { ArrowRight, CalendarDays, Inbox, MessageSquareQuote, TrendingUp } from "lucide-react";
import { DataStatus } from "@/components/admin/data-status";
import { sheetsEnabled } from "@/lib/sheets";
import { getDb, usingSupabase } from "@/lib/store";
import { darwinISODate, formatDisplayDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const db = await getDb();
  const today = darwinISODate();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const leadsToday = db.leads.filter((item) => darwinISODate(new Date(item.createdAt)) === today).length + db.bookings.filter((item) => darwinISODate(new Date(item.createdAt)) === today).length;
  const fresh = db.leads.filter((item) => item.status === "new").length + db.bookings.filter((item) => item.status === "new").length;
  const week = [...db.leads, ...db.bookings].filter((item) => new Date(item.createdAt).getTime() >= weekAgo).length;
  const pendingReviews = db.reviews.filter((review) => review.status === "pending");
  const counts = ["new", "contacted", "quoted", "booked", "completed", "lost"].map((status) => ({
    status,
    count: db.leads.filter((item) => item.status === status).length + db.bookings.filter((item) => item.status === status).length,
  }));
  const activity = [
    ...db.leads.map((item) => ({ id: item.id, when: item.createdAt, label: `${item.source === "chat" ? "Chat" : item.source === "quote" ? "Quote" : "Message"} · ${item.name}`, detail: item.summary || item.message, ref: item.reference })),
    ...db.bookings.map((item) => ({ id: item.id, when: item.createdAt, label: `Booking · ${item.name}`, detail: `${item.date} · ${item.suburb}`, ref: item.reference })),
  ].sort((a, b) => b.when.localeCompare(a.when)).slice(0, 8);
  const missingVideos = db.services.filter((service) => service.visible && !service.videoUrl).length;
  const missingPhotos = db.results.filter((item) => item.illustrative).length;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-slate">G’day 👋</p>
        <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
      </div>
      {(!usingSupabase() || !sheetsEnabled()) && <DataStatus supabase={usingSupabase()} sheets={sheetsEnabled()} />}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Inbox className="h-5 w-5" />} label="New, not yet contacted" value={fresh} href="/admin/leads" tone="bg-sun-soft text-[#8A5A00]" />
        <Stat icon={<CalendarDays className="h-5 w-5" />} label="Requests today" value={leadsToday} href="/admin/leads" tone="bg-brand-light text-brand" />
        <Stat icon={<TrendingUp className="h-5 w-5" />} label="Requests this week" value={week} href="/admin/leads" tone="bg-leaf-soft text-leaf-dark" />
        <Stat icon={<MessageSquareQuote className="h-5 w-5" />} label="Reviews to approve" value={pendingReviews.length} href="/admin/reviews" tone="bg-mist text-navy" />
      </div>
      {pendingReviews.length > 0 && (
        <Link href="/admin/reviews" className="flex items-center gap-4 rounded-card bg-navy p-5 text-white shadow-card">
          <MessageSquareQuote className="h-8 w-8 text-sky" aria-hidden />
          <div className="flex-1"><p className="font-bold">{pendingReviews.length} review{pendingReviews.length === 1 ? "" : "s"} waiting for approval</p><p className="text-sm text-white/70">Latest from {pendingReviews[pendingReviews.length - 1].name}: “{pendingReviews[pendingReviews.length - 1].text.slice(0, 80)}…”</p></div>
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
      )}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-card bg-white p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-navy">Latest enquiries</h2>
            <Link href="/admin/leads" className="text-sm font-semibold text-brand">Open all</Link>
          </div>
          {activity.length === 0 && <p className="mt-3 text-slate">No enquiries yet. They’ll show here as soon as someone uses the chat, quote or booking form.</p>}
          <ul className="mt-3 divide-y divide-line">
            {activity.map((item) => <li key={item.id} className="py-3"><p className="font-semibold text-navy">{item.label} <span className="text-xs font-normal text-slate">{item.ref}</span></p><p className="truncate text-sm text-slate">{item.detail}</p><p className="text-xs text-slate">{formatDisplayDateTime(item.when)}</p></li>)}
          </ul>
        </section>
        <div className="space-y-6">
          <section className="rounded-card bg-white p-5 shadow-card">
            <h2 className="text-xl font-bold text-navy">Pipeline</h2>
            <ul className="mt-3 space-y-2">{counts.map((item) => <li key={item.status} className="flex items-center justify-between capitalize"><span className="text-slate">{item.status}</span><span className="font-bold text-navy">{item.count}</span></li>)}</ul>
          </section>
          <section className="rounded-card bg-white p-5 shadow-card">
            <h2 className="text-xl font-bold text-navy">Make the site shine</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="font-semibold text-brand" href="/admin/services">{missingVideos} services</Link> still need a video</li>
              <li><Link className="font-semibold text-brand" href="/admin/results">{missingPhotos} before/after pairs</Link> are illustrations. Swap in real job photos</li>
              {!db.settings.google && <li><Link className="font-semibold text-brand" href="/admin/settings">Add your Google review link</Link></li>}
              {!db.settings.facebook && <li><Link className="font-semibold text-brand" href="/admin/settings">Add Facebook, Instagram & TikTok</Link></li>}
              {!db.settings.teamPhoto && <li><Link className="font-semibold text-brand" href="/admin/media">Upload a team photo</Link> in uniform</li>}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, href, tone }: { icon: React.ReactNode; label: string; value: number; href: string; tone: string }) {
  return (
    <Link href={href} className="rounded-card bg-white p-5 shadow-card transition hover:-translate-y-0.5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <p className="mt-3 text-3xl font-bold text-navy">{value}</p>
      <p className="text-sm text-slate">{label}</p>
    </Link>
  );
}
