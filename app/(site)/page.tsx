import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FaqList } from "@/components/content";
import { DayCycle, type DayMoment } from "@/components/home/day-cycle";
import { ExperienceList } from "@/components/home/experiences";
import { ExpandingFilm } from "@/components/home/film";
import { Finale } from "@/components/home/finale";
import { GalleryColumns } from "@/components/home/gallery-columns";
import { CinematicHero } from "@/components/home/hero";
import { Journey } from "@/components/home/journey";
import { Packages } from "@/components/home/packages";
import { ReviewsCarousel } from "@/components/home/reviews-carousel";
import { RoomsRail } from "@/components/home/rooms-rail";
import { Statement } from "@/components/home/statement";
import { Reveal, SplitWords } from "@/components/motion/primitives";
import { VelocityMarquee } from "@/components/motion/velocity-marquee";
import { whatsappHref } from "@/components/social";
import { ROOM_CATEGORIES, addDaysIso } from "@/lib/constants";
import { GALLERY, STOCK, STOCK_CLIPS } from "@/lib/stock";
import { getDb } from "@/lib/store";
import { byOrder, darwinISODate, filled, safeHttpUrl } from "@/lib/utils";
import { isOfferLive } from "@/lib/validators";

const MOMENTS: DayMoment[] = [
  { time: "06:30", title: "First light on the harbour", text: "Sunrise yoga on the lawn, or a slow coffee on your balcony as the boats head out.", image: STOCK.room, href: "/services/harbour-king" },
  { time: "08:30", title: "Breakfast, slowly", text: "Tropical fruit, bush-tomato eggs and barista coffee: free on stays of two nights or more.", image: STOCK.breakfast, href: "/offers" },
  { time: "12:00", title: "The lagoon pool", text: "Palms, cabanas and cocktails delivered to your sun lounger. The kids have their own shallow end.", image: STOCK.pool, href: "/why-us" },
  { time: "15:00", title: "Mangrove Day Spa", text: "Kakadu plum facials and lemon myrtle massages while the afternoon heat passes.", image: STOCK.spa, href: "/services/day-spa" },
  { time: "18:45", title: "Golden hour on the deck", text: "The harbour turns orange. Find a seat on the Saltwater deck with a gin made in Darwin.", image: STOCK.sunset, href: "/services/saltwater-restaurant" },
  { time: "20:30", title: "Dinner under the stars", text: "Barramundi off the boats and mud crab with chilli, then a night swim in your villa pool.", image: STOCK.dining, href: "/services/saltwater-restaurant" },
];

export default async function HomePage() {
  const db = await getDb();
  const s = db.settings;
  const offers = byOrder(db.offers).filter((offer) => isOfferLive(offer)).slice(0, 3);
  const services = byOrder(db.services).filter((service) => service.visible);
  const rooms = services.filter((service) => ROOM_CATEGORIES.includes(service.category));
  const experiences = services.filter((service) => !ROOM_CATEGORIES.includes(service.category));
  const reviews = byOrder(db.reviews).filter((review) => review.status === "approved").slice(0, 6);
  const faqs = byOrder(db.faqs).slice(0, 5);
  const today = darwinISODate();
  // Admin can set the hero to their own photo, or to a video file, which then plays instead of the stock clip.
  const heroIsPhoto = filled(s.heroImage) && !/\.(mp4|webm|mov)(\?|$)/i.test(s.heroImage);
  const gallery = GALLERY.flatMap((group) => group.images);
  const totalRooms = rooms.reduce((sum, room) => sum + room.rooms, 0);
  const googleHref = safeHttpUrl(s.google) || `https://www.google.com/maps/search/${encodeURIComponent(`${s.businessName} Darwin`)}`;

  return (
    <>
      <CinematicHero headline={s.heroHeadline} subtext={s.heroSubtext} heroImage={s.heroImage} heroIsPhoto={heroIsPhoto} clip={STOCK_CLIPS[0]} today={today} checkIn={addDaysIso(today, 7)} checkOut={addDaysIso(today, 9)} />

      <div className="border-y border-white/10 bg-navy-deep py-6 text-[#F4EFE6]">
        <VelocityMarquee items={["Harbour View", "Darwin Waterfront", "Private pool villas", "Saltwater deck", "Top End sunsets"]} className="font-display text-5xl font-light italic md:text-7xl" />
      </div>

      <Statement
        pieces={[
          ..."A small luxury resort where".split(" ").map((word) => ({ word })),
          { image: STOCK.pool, alt: "The lagoon pool" },
          ..."the harbour meets the sky — long sunsets,".split(" ").map((word) => ({ word })),
          { image: STOCK.villa, alt: "A private pool villa" },
          ..."private pools and the slow rhythm of the".split(" ").map((word) => ({ word })),
          { image: STOCK.sunset, alt: "A Top End sunset" },
          ..."Top End.".split(" ").map((word) => ({ word })),
        ]}
        stats={[
          [String(totalRooms), "Rooms, suites & villas"],
          ["15 min", "From Darwin Airport"],
          ["270°", "Penthouse harbour views"],
          ["365", "Sunsets a year"],
        ]}
      />

      <RoomsRail rooms={rooms} />

      <ExpandingFilm clip={STOCK_CLIPS[1]} eyebrow="Take a look" left="Slow" right="down" caption="Every room faces the water or the gardens. Every evening ends in gold." />

      <DayCycle moments={MOMENTS} />

      <ExperienceList items={experiences} />

      <Packages offers={offers} images={[STOCK.breakfast, STOCK.suite, STOCK.twin]} />

      <GalleryColumns images={gallery} />

      <Journey address={s.address} />

      <ReviewsCarousel reviews={reviews} googleHref={googleHref} />

      {/* FAQ */}
      <section className="bg-[#F4EFE6] py-24 md:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-brand"><span className="h-px w-10 bg-brand" /> Questions</p>
            <SplitWords text="Before you arrive" className="mt-6 font-display text-5xl font-medium leading-[0.95] tracking-[-0.03em] text-navy md:text-7xl" />
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-sm text-lg text-slate">Can’t see yours? Ask our concierge in the chat or message us on <a href={whatsappHref(s)} className="font-semibold text-brand underline" target="_blank" rel="noopener noreferrer">WhatsApp</a>.</p>
              <Link href="/faqs" className="group mt-8 inline-flex items-center gap-2 text-lg font-semibold text-navy">All FAQs <ArrowUpRight className="h-5 w-5 transition group-hover:rotate-45" aria-hidden /></Link>
            </Reveal>
          </div>
          <Reveal><FaqList faqs={faqs} /></Reveal>
        </div>
      </section>

      <Finale clip={STOCK_CLIPS[2]} phoneTel={s.phoneTel} phoneDisplay={s.phoneDisplay} />
    </>
  );
}
