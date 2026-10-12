import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { BookingForm } from "@/components/forms/booking-form";
import { PageHero } from "@/components/content";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";
import { STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Book your stay",
  description: "Check live availability for rooms, suites and private pool villas at Harbour View Resort Darwin, and book direct for the best rate.",
};

const day = (value?: string) => (value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined);

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ service?: string; checkIn?: string; checkOut?: string; adults?: string; children?: string }> }) {
  const params = await searchParams;
  const db = await getDb();
  const initialService = db.services.some((item) => item.slug === params.service && item.visible) ? params.service : "";
  return (
    <>
      <PageHero image={STOCK.room} eyebrow="Reservations" title="Book your stay." lede="Choose your dates to see live availability for every room. Nothing is charged until our team confirms your booking with you." crumbs={[{ href: "/booking", label: "Book" }]}>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/85">
          {["Best rate, guaranteed direct", "Free breakfast on 2+ nights", "Free cancellation up to 48 hours"].map((item) => <li key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sky" aria-hidden /> {item}</li>)}
        </ul>
      </PageHero>
      <section className="section pt-12">
        <div className="container-x max-w-5xl">
          <BookingForm
            services={byOrder(db.services).filter((item) => item.visible)}
            settings={db.settings}
            initialService={initialService}
            initial={{ checkIn: day(params.checkIn), checkOut: day(params.checkOut), adults: Number(params.adults) || undefined, children: Number(params.children) || undefined }}
          />
        </div>
      </section>
    </>
  );
}
