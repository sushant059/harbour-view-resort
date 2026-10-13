import { RevealObserver } from "@/components/fade-in";
import { Cursor } from "@/components/motion/cursor";
import { Preloader } from "@/components/motion/preloader";
import { ScrollProgress } from "@/components/motion/primitives";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { OfferBanner } from "@/components/layout/offer-banner";
import { SiteWidgets } from "@/components/layout/site-widgets";
import { getDb } from "@/lib/store";
import { byOrder, filled, safeHttpUrl, siteUrl } from "@/lib/utils";
import { isOfferLive } from "@/lib/validators";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const db = await getDb();
  const banner = db.offers.find((offer) => offer.showOnBanner && isOfferLive(offer) && offer.bannerText);
  const services = byOrder(db.services)
    .filter((service) => service.visible)
    .map(({ slug, title, icon, category }) => ({ slug, title, icon, category }));
  const approved = db.reviews.filter((review) => review.status === "approved" && review.source !== "sample");
  const sameAs = [db.settings.facebook, db.settings.instagram, db.settings.tiktok, db.settings.youtube, db.settings.google].filter((url) => safeHttpUrl(url));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: db.settings.businessName,
    telephone: db.settings.phoneTel,
    email: db.settings.email,
    url: siteUrl(),
    image: `${siteUrl()}/hvr-mark.png`,
    areaServed: "Darwin, Northern Territory",
    ...(sameAs.length ? { sameAs } : {}),
    ...(approved.length >= 3
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: (approved.reduce((sum, review) => sum + review.rating, 0) / approved.length).toFixed(1), reviewCount: approved.length } }
      : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Darwin",
      addressRegion: "NT",
      addressCountry: "AU",
      ...(filled(db.settings.address) ? { streetAddress: db.settings.address } : {}),
    },
  };
  return (
    <>
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-white focus:px-4 focus:py-3 focus:text-navy">Skip to content</a>
      <SmoothScroll>
        <Preloader />
        <ScrollProgress />
        {/* Fixed over each page's full-bleed opening scene; it slides away as you read down. */}
        <div className="fixed inset-x-0 top-0 z-40">
          <Header settings={db.settings} services={services} />
        </div>
        <main id="content" className="pb-16 md:pb-0">{children}</main>
        {banner && <OfferBanner id={banner.id} text={banner.bannerText} href={banner.href || "/offers"} settings={db.settings} />}
        <Footer settings={db.settings} services={db.services} />
        <SiteWidgets settings={db.settings} services={services} />
        <RevealObserver />
        <Cursor />
        <div className="grain animate-grain" aria-hidden />
      </SmoothScroll>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
