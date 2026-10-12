import type { Metadata } from "next";
import { PageHero } from "@/components/content";
import { getDb } from "@/lib/store";
import { STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Harbour View Resort Darwin collects and uses personal information for bookings and enquiries.",
};

export default async function PrivacyPage() {
  const { settings } = await getDb();
  return (
    <>
      <PageHero image={STOCK.pool} eyebrow="Privacy" title="Privacy policy" lede="A plain-language summary for guests. It is not a substitute for legal advice." />
      <section className="section pt-12">
        <div className="container-x card max-w-3xl space-y-4 p-6 text-slate md:p-10">
          <p>{settings.businessName} collects your name, phone number, email, where you are travelling from, your stay dates, guest numbers and any requests you send. We use that information to confirm and look after your booking and to reply to you.</p>
          <p>For privacy requests, email {settings.email}. You can ask what we hold about you and ask us to correct it. We delete old enquiries when we no longer need them for your stay or for ordinary record-keeping.</p>
          <p>We do not sell personal information. Staff and the providers who host the website, store data or send email may handle it so the site can work, including Vercel, Supabase and Google. Their servers may be outside Australia.</p>
          <p>We only send offers by email or text if you have agreed to receive them, and every offer includes a way to opt out. Please don’t send card numbers through the website forms; we send secure payment details when we confirm your booking.</p>
          <p>If you think we have handled your information poorly, contact us first. You can also contact the Office of the Australian Information Commissioner.</p>
        </div>
      </section>
    </>
  );
}
