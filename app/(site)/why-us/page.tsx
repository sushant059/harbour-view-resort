import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CtaBand, PageHero, Pillars, SectionHeading, TeamVisual } from "@/components/content";
import { Photo } from "@/components/photo";
import { getDb } from "@/lib/store";
import { STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "The resort",
  description: "A small luxury resort on the Darwin Waterfront with harbour-view rooms, private pool villas, a day spa and the Saltwater Restaurant.",
};

export default async function ResortPage() {
  const db = await getDb();
  const s = db.settings;
  return (
    <>
      <PageHero image={STOCK.hero} eyebrow="The resort" title="Where the harbour meets the tropics." lede="A small luxury resort on the Darwin Waterfront, made for slow mornings, long lunches and big Top End sunsets." crumbs={[{ href: "/why-us", label: "The resort" }]} />
      <section className="section pt-12">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <TeamVisual photo={s.teamPhoto} />
          <div>
            <SectionHeading eyebrow="Our story" title="Personal service, every stay." lede="We’re locally owned and intentionally small, so our team knows your name, your coffee and the table you like at sunset." />
            <ul className="mt-6 space-y-3">
              {["Every booking confirmed by a real person", "Local tips for Kakadu, Litchfield and the markets", "Cots, high chairs and kids’ packs on request", "Accessible rooms with roll-in showers"].map((item) => (
                <li key={item} className="flex items-center gap-3 font-semibold text-navy"><CheckCircle2 className="h-5 w-5 text-brand" aria-hidden /> {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="section bg-mist">
        <div className="container-x">
          <SectionHeading eyebrow="Facilities" title="Everything on site" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [STOCK.pool, "Lagoon pool", "Sun lounges, cabanas and poolside service."],
              [STOCK.spa, "Mangrove Day Spa", "Massages, facials and couples’ rituals."],
              [STOCK.dining, "Saltwater Restaurant", "Breakfast, lunch, dinner and sunset drinks."],
              [STOCK.lobby, "Lounge & reception", "Open 24 hours, with luggage storage."],
            ].map(([images, title, text]) => (
              <article key={title as string} className="overflow-hidden rounded-card border border-line bg-white">
                <div className="relative aspect-[4/3] bg-mist"><Photo stock={images as typeof STOCK.pool} alt={title as string} fill sizes="(max-width: 640px) 100vw, 25vw" /></div>
                <div className="p-5"><h3 className="font-display text-xl font-semibold text-navy">{title as string}</h3><p className="mt-1 text-slate">{text as string}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Why guests return" title="Little luxuries, every day" />
          <div className="mt-10"><Pillars /></div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/booking" className="inline-flex min-h-12 items-center rounded-full bg-navy px-6 font-semibold text-white hover:bg-navy-deep">Check availability</Link>
            <Link href="/results" className="inline-flex min-h-12 items-center rounded-full border border-navy/20 px-6 font-semibold text-navy hover:border-brand">See the gallery</Link>
          </div>
        </div>
      </section>
      <CtaBand settings={s} />
    </>
  );
}
