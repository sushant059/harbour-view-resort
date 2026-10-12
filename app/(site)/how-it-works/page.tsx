import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHero, SectionHeading, Steps } from "@/components/content";
import { getDb } from "@/lib/store";
import { STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Plan your stay",
  description: "How booking works at Harbour View Resort Darwin, plus check-in times, getting here and what's included.",
};

const INFO = [
  ["Check-in", "From 2pm", "Early check-in on request, depending on the day."],
  ["Check-out", "By 11am", "Late check-out until 2pm when available."],
  ["Breakfast", "6:30–10:30am", "Free on direct stays of two nights or more."],
  ["Airport", "15 minutes", "Private transfers for any flight, day or night."],
];

export default async function PlanPage() {
  const db = await getDb();
  return (
    <>
      <PageHero image={STOCK.breakfast} eyebrow="Plan your stay" title="Simple to book. Easy to arrive." lede="Choose your dates online, and our team confirms everything personally. Here’s what to expect." crumbs={[{ href: "/how-it-works", label: "Plan your stay" }]} />
      <section className="section pt-12">
        <div className="container-x"><Steps /></div>
      </section>
      <section className="section bg-mist">
        <div className="container-x">
          <SectionHeading eyebrow="Good to know" title="Times and essentials" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INFO.map(([item, time, note]) => (
              <div key={item} className="card p-5">
                <p className="text-sm font-semibold text-slate">{item}</p>
                <p className="mt-1 font-display text-2xl font-semibold text-navy">{time}</p>
                <p className="mt-1 text-sm text-slate">{note}</p>
              </div>
            ))}
          </div>
          <Link href="/booking" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-navy px-6 font-semibold text-white hover:bg-navy-deep">Check availability</Link>
        </div>
      </section>
      <CtaBand settings={db.settings} />
    </>
  );
}
