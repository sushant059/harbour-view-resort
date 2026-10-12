import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHero, SectionHeading, ServiceCard } from "@/components/content";
import { FadeIn } from "@/components/fade-in";
import { ServiceIcon } from "@/components/icons";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { STOCK } from "@/lib/stock";
import { getDb } from "@/lib/store";
import { byOrder, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rooms, suites & experiences",
  description: "Harbour-view rooms, family suites, private pool villas and the Sky Penthouse, plus dining, spa, weddings and airport transfers at Harbour View Resort Darwin.",
};

export default async function ServicesPage() {
  const db = await getDb();
  const services = byOrder(db.services).filter((service) => service.visible);
  return (
    <>
      <PageHero image={STOCK.suite} eyebrow="Stay & experience" title="Rooms, suites & experiences." lede="Every room comes with Wi-Fi, pool and gym access. Choose a room to see the details, photos and live availability." crumbs={[{ href: "/services", label: "Rooms & suites" }]}>
        <div className="mt-8 flex flex-wrap gap-2">
          {SERVICE_CATEGORIES.map((category) => (
            <Link key={category.id} href={`#${category.id}`} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white hover:text-navy">
              <ServiceIcon name={category.icon} className="h-4 w-4" /> {category.title}
            </Link>
          ))}
        </div>
      </PageHero>
      {SERVICE_CATEGORIES.map((category, index) => {
        const items = services.filter((service) => service.category === category.id);
        if (!items.length) return null;
        return (
          <section key={category.id} id={category.id} className={cn("section scroll-mt-24", index % 2 === 1 && "bg-mist")}>
            <div className="container-x">
              <SectionHeading eyebrow={category.short} title={category.title} lede={category.blurb} />
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((service, position) => <FadeIn key={service.id} delay={position * 60}><ServiceCard service={service} /></FadeIn>)}
              </div>
            </div>
          </section>
        );
      })}
      <CtaBand settings={db.settings} />
    </>
  );
}
