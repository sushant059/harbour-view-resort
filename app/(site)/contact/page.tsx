import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageSquareText, Phone } from "lucide-react";
import { PageHero } from "@/components/content";
import { ContactForm } from "@/components/forms/contact-form";
import { BrandIcon, SocialIcons, whatsappHref } from "@/components/social";
import { getDb } from "@/lib/store";
import { filled } from "@/lib/utils";
import { STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call, WhatsApp or email Harbour View Resort Darwin.",
};

export default async function ContactPage() {
  const db = await getDb();
  const s = db.settings;
  const cards = [
    { icon: <Phone className="h-6 w-6" aria-hidden />, label: "Call us", value: s.phoneDisplay, href: `tel:${s.phoneTel}`, tint: "bg-brand-light text-brand" },
    { icon: <BrandIcon name="whatsapp" className="h-6 w-6" />, label: "WhatsApp", value: "Message us any time", href: whatsappHref(s), tint: "bg-[#E7F9EE] text-[#1DA851]", external: true },
    { icon: <Mail className="h-6 w-6" aria-hidden />, label: "Email", value: s.email, href: `mailto:${s.email}`, tint: "bg-sun-soft text-[#8A5A00]" },
  ];
  return (
    <>
      <PageHero image={STOCK.lobby} eyebrow="Contact" title="We’d love to welcome you." lede="Call, WhatsApp, email or chat with our concierge. To book a room, the booking page shows live availability." crumbs={[{ href: "/contact", label: "Contact" }]} />
      <section className="section pt-12">
        <div className="container-x">
          <div className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <a key={card.label} href={card.href} target={card.external ? "_blank" : undefined} rel={card.external ? "noopener noreferrer" : undefined} className="card group flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-soft">
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${card.tint}`}>{card.icon}</span>
                <span className="min-w-0"><span className="block text-sm text-slate">{card.label}</span><span className="block truncate font-display text-lg font-bold text-navy">{card.value}</span></span>
              </a>
            ))}
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-navy"><Clock className="h-5 w-5 text-brand" aria-hidden /> Opening hours</h2>
                <ul className="mt-4 divide-y divide-line">{s.openingHours.map((hour) => <li key={hour.day} className="flex justify-between gap-4 py-2.5"><span className="text-slate">{hour.day}</span><span className="font-semibold text-navy">{hour.hours}</span></li>)}</ul>
              </div>
              <div className="card p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-navy"><MapPin className="h-5 w-5 text-brand" aria-hidden /> Where we work</h2>
                <p className="mt-2 text-slate">{filled(s.address) ? s.address : "Darwin, Palmerston, Howard Springs, Humpty Doo and surrounding suburbs."}</p>
                <h2 className="mt-6 font-display text-xl font-bold text-navy">Follow us</h2>
                <SocialIcons settings={s} tone="color" className="mt-3" />
              </div>
              <button type="button" data-open-chat className="card flex w-full items-center gap-4 p-5 text-left transition hover:shadow-soft">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-navy text-white"><MessageSquareText className="h-6 w-6" aria-hidden /></span>
                <span><span className="block font-display text-lg font-bold text-navy">Book with our chat assistant</span><span className="text-sm text-slate">Answer a few questions and we’ll call you back.</span></span>
              </button>
            </div>
            <div className="card p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold text-navy">Send us a message</h2>
              <p className="mt-1 text-slate">We reply within business hours.</p>
              <div className="mt-6"><ContactForm /></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
