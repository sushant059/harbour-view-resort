import Link from "next/link";
import { ArrowRight, Car, Clock, MapPin, MessageSquareText, Plane, Star } from "lucide-react";
import { CtaBand, FaqList, GoogleReviewButton, Pillars, ReviewCard, SectionHeading, ServiceCard, TeamVisual, TrustMarquee } from "@/components/content";
import { FadeIn } from "@/components/fade-in";
import { HeroSearch, VideoShowcase } from "@/components/home/interactive";
import { BackgroundVideo, Photo } from "@/components/photo";
import { OfferCard } from "@/components/offers";
import { whatsappHref } from "@/components/social";
import { ROOM_CATEGORIES, addDaysIso } from "@/lib/constants";
import { GALLERY, STOCK, STOCK_CLIPS, serviceStock } from "@/lib/stock";
import { getDb } from "@/lib/store";
import { byOrder, darwinISODate, filled } from "@/lib/utils";
import { isOfferLive } from "@/lib/validators";

export default async function HomePage() {
  const db = await getDb();
  const s = db.settings;
  const offers = byOrder(db.offers).filter((offer) => isOfferLive(offer));
  const services = byOrder(db.services).filter((service) => service.visible);
  const rooms = services.filter((service) => ROOM_CATEGORIES.includes(service.category));
  const experiences = services.filter((service) => !ROOM_CATEGORIES.includes(service.category));
  const reviews = byOrder(db.reviews).filter((review) => review.status === "approved").slice(0, 3);
  const faqs = byOrder(db.faqs).slice(0, 5);
  const today = darwinISODate();
  // Admin can set the hero to their own photo, or to a video file, which then plays instead of the stock clip.
  const heroIsPhoto = filled(s.heroImage) && !/\.(mp4|webm|mov)(\?|$)/i.test(s.heroImage);
  const mosaic = GALLERY.flatMap((group) => group.images).slice(0, 7);

  return (
    <>
      {/* Hero: full-bleed video with the date search on top */}
      <section className="relative isolate overflow-hidden bg-navy-deep text-white">
        {heroIsPhoto ? <Photo src={s.heroImage} fill priority sizes="100vw" className="-z-20" /> : <BackgroundVideo clip={STOCK_CLIPS[0]} src={s.heroImage} className="-z-20" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-deep/70 via-navy-deep/35 to-navy-deep/90" aria-hidden />
        <div className="container-x flex min-h-[calc(100svh-110px)] flex-col justify-end gap-10 pb-10 pt-24 md:pb-14">
          <div className="max-w-3xl animate-rise">
            <p className="eyebrow text-sky">Darwin Waterfront · Northern Territory</p>
            <h1 className="mt-5 font-display text-[44px] font-semibold leading-[1.02] sm:text-6xl lg:text-[84px]">{s.heroHeadline}</h1>
            <p className="mt-6 max-w-xl text-lg text-white/85 md:text-xl">{s.heroSubtext}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/services" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/50 px-7 text-lg font-semibold text-white transition hover:bg-white hover:text-navy">Explore rooms & suites <ArrowRight className="h-5 w-5" aria-hidden /></Link>
              <button type="button" data-open-chat className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-5 text-lg font-semibold text-sky hover:text-white"><MessageSquareText className="h-5 w-5" aria-hidden /> Ask our concierge</button>
            </div>
          </div>
          <HeroSearch today={today} tomorrow={addDaysIso(today, 7)} later={addDaysIso(today, 9)} />
        </div>
      </section>

      <TrustMarquee />

      {/* Welcome */}
      <section className="section overflow-hidden">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Welcome" title="A waterfront sanctuary in the heart of Darwin." lede="Wake to the harbour, spend the afternoon between the lagoon pool and the spa, and toast the sunset on the Saltwater deck. Harbour View is a small luxury resort with big Top End skies." />
            <dl className="mt-8 grid grid-cols-3 gap-3">
              {[
                [`${rooms.reduce((sum, room) => sum + room.rooms, 0)}`, "rooms, suites & villas"],
                ["15 min", "from Darwin Airport"],
                ["2pm", "check-in"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-line bg-white p-4">
                  <dd className="font-display text-2xl font-semibold text-navy md:text-3xl">{value}</dd>
                  <dt className="text-sm text-slate">{label}</dt>
                </div>
              ))}
            </dl>
            <Link href="/why-us" className="link-arrow mt-8">Discover the resort <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <FadeIn><TeamVisual photo={s.teamPhoto} /></FadeIn>
        </div>
      </section>

      {/* Rooms & suites */}
      <section className="section bg-mist">
        <div className="container-x">
          <SectionHeading eyebrow="Stay" title="Rooms, suites & villas" lede="From harbour-view kings to a private pool villa. Every rate includes Wi-Fi, pool and gym access." action={<Link href="/booking" className="link-arrow">Check availability <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />
        </div>
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-8">
          {rooms.map((room) => <div key={room.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-auto"><ServiceCard service={room} /></div>)}
        </div>
      </section>

      {/* Experiences */}
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Experience" title="Dine, unwind and celebrate" />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {experiences.map((item, index) => (
              <FadeIn key={item.id} delay={index * 80}>
                <Link href={`/services/${item.slug}`} className={`group relative isolate flex min-h-[340px] flex-col justify-end overflow-hidden rounded-card p-6 text-white ${index === 0 ? "lg:min-h-[420px]" : ""}`}>
                  <Photo src={item.image} stock={serviceStock(item.slug)} alt={item.title} fill sizes="(max-width: 768px) 100vw, 25vw" className="-z-20 transition duration-700 group-hover:scale-105" />
                  <span className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep via-navy-deep/40 to-transparent" aria-hidden />
                  <span className="font-display text-2xl font-semibold">{item.title}</span>
                  <span className="mt-2 text-sm text-white/80">{item.summary}</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky">Discover <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden /></span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      {offers.length > 0 && (
        <section className="section bg-mist">
          <div className="container-x">
            <SectionHeading eyebrow="Packages" title="Offers for direct guests" action={<Link href="/offers" className="link-arrow">All packages <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {offers.slice(0, 3).map((offer, index) => <FadeIn key={offer.id} delay={index * 80}><OfferCard offer={offer} featured={index === 0} /></FadeIn>)}
            </div>
          </div>
        </section>
      )}

      {/* Videos */}
      <section className="section relative isolate overflow-hidden bg-navy text-white">
        <div className="container-x">
          <p className="eyebrow text-sky">Take a look</p>
          <h2 className="mt-3 max-w-3xl font-display text-[32px] font-semibold leading-[1.1] md:text-5xl">See where you’ll be staying.</h2>
          <div className="mt-10"><VideoShowcase services={rooms} /></div>
        </div>
      </section>

      {/* Highlights */}
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Why guests return" title="Little luxuries, every day" />
          <div className="mt-10"><Pillars /></div>
        </div>
      </section>

      {/* Gallery mosaic */}
      <section className="section bg-mist">
        <div className="container-x">
          <SectionHeading eyebrow="Gallery" title="Moments at Harbour View" action={<Link href="/results" className="link-arrow">Full gallery <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />
          <div className="mt-10 grid auto-rows-[150px] grid-cols-2 gap-3 md:auto-rows-[200px] md:grid-cols-4">
            {mosaic.map((image, index) => (
              <div key={`${image.id}-${index}`} className={`relative overflow-hidden rounded-2xl bg-white ${index === 0 ? "col-span-2 row-span-2" : ""} ${index === 3 ? "md:col-span-2" : ""}`}>
                <Photo stock={[image]} alt={image.alt} fill sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"} className="transition duration-700 hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section">
        <div className="container-x">
          <SectionHeading
            eyebrow="Guest reviews"
            title="What our guests say"
            action={
              <div className="flex flex-wrap gap-3">
                <Link href="/reviews#write" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-5 font-semibold text-white hover:bg-navy-deep"><Star className="h-4 w-4" aria-hidden /> Leave a review</Link>
                <GoogleReviewButton settings={s} />
              </div>
            }
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((review, index) => <FadeIn key={review.id} delay={index * 80}><ReviewCard review={review} /></FadeIn>)}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section relative isolate overflow-hidden text-white">
        <Photo stock={STOCK.sunset} fill sizes="100vw" className="-z-20" />
        <div className="absolute inset-0 -z-10 bg-navy-deep/80" aria-hidden />
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow text-sky">Getting here</p>
            <h2 className="mt-3 font-display text-[32px] font-semibold leading-[1.1] md:text-5xl">On the Darwin Waterfront</h2>
            <p className="mt-4 max-w-xl text-lg text-white/80">{s.address}. Walk to the wave lagoon, restaurants and the city centre; Mindil Beach sunset markets are a short drive away.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              [Plane, "Darwin Airport", "About 15 minutes by car"],
              [Car, "Private transfers", "Meet and greet, any flight"],
              [Clock, "Check-in / out", "From 2pm / by 11am"],
              [MapPin, "City centre", "A 5-minute walk"],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Plane;
              return (
                <li key={title as string} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
                  <I className="h-5 w-5 text-sky" aria-hidden />
                  <p className="mt-2 font-semibold">{title as string}</p>
                  <p className="text-sm text-white/70">{text as string}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionHeading eyebrow="Questions" title="Before you arrive" />
            <p className="mt-4 text-slate">Can’t see yours? Ask our concierge in the chat or message us on <a href={whatsappHref(s)} className="font-semibold text-brand underline" target="_blank" rel="noopener noreferrer">WhatsApp</a>.</p>
            <Link href="/faqs" className="link-arrow mt-6">All FAQs <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <FaqList faqs={faqs} />
        </div>
      </section>

      <CtaBand settings={s} />
    </>
  );
}
