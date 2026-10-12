import type { Metadata } from "next";
import { CheckCircle2, MessageSquareText } from "lucide-react";
import { PageHero } from "@/components/content";
import { QuoteForm } from "@/components/forms/quote-form";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";
import { STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Enquire",
  description: "Enquire about weddings, events, group stays, dining, spa and transfers at Harbour View Resort Darwin.",
};

export default async function EnquirePage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const db = await getDb();
  const initial = db.services.some((item) => item.slug === service && item.visible) ? service : "";
  return (
    <>
      <PageHero image={STOCK.events} eyebrow="Enquiries" title="Plan something special." lede="Weddings, celebrations, group stays, private dining or spa days. Tell us what you have in mind and our team will come back with options." crumbs={[{ href: "/free-quote", label: "Enquire" }]} />
      <section className="section pt-12">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            {["A dedicated coordinator replies personally", "Group room rates for your guests", "Custom menus and packages", "No obligation, no deposit to enquire"].map((item) => (
              <p key={item} className="flex items-center gap-3 font-semibold text-navy"><CheckCircle2 className="h-6 w-6 text-brand" aria-hidden /> {item}</p>
            ))}
            <button type="button" data-open-chat className="card mt-6 flex w-full items-center gap-4 p-5 text-left transition hover:shadow-soft">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy text-white"><MessageSquareText className="h-5 w-5" aria-hidden /></span>
              <span><span className="block font-semibold text-navy">Prefer to chat?</span><span className="text-sm text-slate">Our concierge assistant can take your request now.</span></span>
            </button>
          </div>
          <div className="card p-6 md:p-8">
            <QuoteForm services={byOrder(db.services).filter((item) => item.visible)} areas={db.settings.serviceAreas} settings={db.settings} initialService={initial} />
          </div>
        </div>
      </section>
    </>
  );
}
