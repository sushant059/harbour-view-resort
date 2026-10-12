import type { Metadata } from "next";
import { PageHero } from "@/components/content";
import { getDb } from "@/lib/store";
import { STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Terms",
  description: "Booking terms for stays and enquiries at Harbour View Resort Darwin.",
};

export default async function TermsPage() {
  const { settings } = await getDb();
  return (
    <>
      <PageHero image={STOCK.pool} eyebrow="Terms" title="Booking terms" lede={`These terms cover booking requests and stays at ${settings.businessName}. They sit alongside the Australian Consumer Law.`} />
      <section className="section pt-12">
        <div className="container-x card max-w-3xl space-y-4 p-6 text-slate md:p-10">
          <p>A request sent through the website, chat or phone holds your room while our team confirms it. It becomes a booking when we confirm the room, dates and rate with you. A reference number is not a tax invoice.</p>
          <p>Check-in is from 2pm and check-out is by 11am. Early check-in and late check-out depend on availability and may carry a charge.</p>
          <p>Standard rates can be cancelled free of charge up to 48 hours before arrival. Packages and special rates may have different conditions, which we confirm before your booking is final.</p>
          <p>Rates shown on the website are per room per night in Australian dollars. Extras such as breakfast, transfers, spa treatments and dining are priced when we confirm.</p>
          <p>Promo codes apply only while active and when confirmed by our team. Nothing in these terms limits rights you have under the Australian Consumer Law that cannot be excluded.</p>
          <p>Questions: {settings.email} or {settings.phoneDisplay}.</p>
        </div>
      </section>
    </>
  );
}
