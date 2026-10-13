import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Car, MapPin, ShieldCheck, Sparkles, Star, Sunset, ThumbsUp, UtensilsCrossed, Waves } from "lucide-react";
import { Photo } from "@/components/photo";
import { FadeIn } from "@/components/fade-in";
import { Magnetic, SplitWords } from "@/components/motion/primitives";
import { VelocityMarquee } from "@/components/motion/velocity-marquee";
import { ServiceIcon } from "@/components/icons";
import { BrandIcon } from "@/components/social";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { categoryStock, serviceStock, STOCK } from "@/lib/stock";
import type { Faq, Review, Service, Settings } from "@/lib/types";
import { cn, filled, formatDisplayDate, safeHttpUrl } from "@/lib/utils";

export { PageHero } from "@/components/page-hero";

export function SectionHeading({ eyebrow, title, lede, align = "left", action }: { eyebrow: string; title: string; lede?: string; align?: "left" | "center"; action?: React.ReactNode }) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-6", align === "center" && "flex-col items-center text-center")}>
      <div className={cn(align === "center" && "flex flex-col items-center")}>
        <p className="eyebrow"><span className="h-px w-10 bg-brand" /> {eyebrow}</p>
        <SplitWords text={title} className="h-section mt-5 max-w-4xl" />
        {lede && <p className="lede" data-reveal>{lede}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5 text-brand", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star key={value} className={cn("h-4 w-4", value <= rating ? "fill-current" : "fill-transparent text-line")} aria-hidden />
      ))}
    </span>
  );
}

export function ReviewCard({ review, className }: { review: Review; className?: string }) {
  const initials = review.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <article className={cn("group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-navy/10 bg-pearl p-7 transition duration-500 hover:-translate-y-1 hover:shadow-soft", className)}>
      <span className="pointer-events-none absolute -right-2 -top-10 font-display text-[160px] leading-none text-brand/10 transition group-hover:text-brand/20" aria-hidden>“</span>
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        {review.source === "google" && <BrandIcon name="google" className="h-5 w-5 text-[#4285F4]" />}
      </div>
      {review.source === "sample" && <p className="mt-3 inline-flex w-fit rounded-full bg-sun-soft px-2.5 py-0.5 text-xs font-bold text-[#8A5A00]">Sample — replace with real reviews</p>}
      <blockquote className="relative mt-5 flex-1 font-display text-2xl font-light leading-snug text-ink">“{review.text}”</blockquote>
      <footer className="mt-6 flex items-center gap-3 border-t border-navy/10 pt-5">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-navy font-display text-lg italic text-sky">{initials || "★"}</span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 font-semibold text-navy">{review.name}{review.source === "customer" && <BadgeCheck className="h-4 w-4 text-brand" aria-label="Verified guest" />}</span>
          <span className="block truncate text-sm text-slate">{[review.service, review.suburb, review.date && formatDisplayDate(review.date)].filter(Boolean).join(" · ")}</span>
        </span>
      </footer>
    </article>
  );
}

/** Google review buttons. Shown even before the Google Business profile exists, using a Maps search as a placeholder. */
export function GoogleReviewButton({ settings, className, label = "Review us on Google" }: { settings: Settings; className?: string; label?: string }) {
  const href = safeHttpUrl(settings.google) || `https://www.google.com/maps/search/${encodeURIComponent(`${settings.businessName} Darwin`)}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn("inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border-2 border-line bg-white px-5 font-semibold text-navy transition hover:border-[#4285F4]", className)}>
      <BrandIcon name="google" className="h-5 w-5 text-[#4285F4]" /> {label}
    </a>
  );
}

const TRUST = [
  [Waves, "Lagoon pool & private plunge pools"],
  [Sparkles, "Mangrove Day Spa"],
  [UtensilsCrossed, "Saltwater Restaurant & Bar"],
  [Car, "15 minutes from Darwin Airport"],
  [ThumbsUp, "Best rate when you book direct"],
  [MapPin, "On the Darwin waterfront"],
] as const;

export function TrustMarquee() {
  return (
    <section className="border-y border-white/10 bg-navy-deep py-5 text-pearl" aria-label="What you can expect">
      <ul className="sr-only">{TRUST.map(([, label]) => <li key={label}>{label}</li>)}</ul>
      <VelocityMarquee items={TRUST.map(([, label]) => label)} baseVelocity={-1.6} className="font-display text-3xl font-light italic md:text-4xl" />
    </section>
  );
}

export function ServiceCard({ service, className }: { service: Service; className?: string }) {
  return (
    <Link href={`/services/${service.slug}`} data-cursor="View" className={cn("group flex h-full flex-col", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-navy">
        <Photo src={service.image} stock={serviceStock(service.slug)} alt={service.title} fill sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 30vw" className="transition duration-[1.4s] ease-out group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-navy-deep/10 to-transparent" aria-hidden />
        <span className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full border border-white/30 text-white backdrop-blur transition duration-500 group-hover:rotate-45 group-hover:border-sky group-hover:bg-sky group-hover:text-navy-deep"><ArrowUpRight className="h-5 w-5" aria-hidden /></span>
        {filled(service.priceFrom) && <span className="absolute bottom-5 left-5 font-display text-2xl text-white">{service.priceFrom}</span>}
        {service.maxGuests > 0 && <span className="absolute bottom-6 right-5 text-[11px] uppercase tracking-[0.24em] text-white/75">Sleeps {service.maxGuests}</span>}
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <h3 className="font-display text-3xl font-medium leading-none text-navy transition group-hover:text-brand">{service.title}</h3>
        <p className="mt-3 line-clamp-3 flex-1 text-[15px] text-slate">{service.summary}</p>
        <span className="relative mt-4 h-px w-full bg-navy/15"><span className="absolute inset-0 origin-left scale-x-0 bg-navy transition duration-700 group-hover:scale-x-100" /></span>
      </div>
    </Link>
  );
}

export function CategoryShowcase({ services }: { services: Service[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {SERVICE_CATEGORIES.map((category, index) => {
        const items = services.filter((service) => service.visible && service.category === category.id);
        if (!items.length) return null;
        return (
          <FadeIn key={category.id} delay={index * 80}>
            <article id={category.id} className="card h-full scroll-mt-28 overflow-hidden">
              <div className="relative isolate flex min-h-[230px] flex-col justify-end overflow-hidden p-6 text-white md:min-h-[280px]">
                <Photo stock={categoryStock(category.id)} alt={category.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="-z-20" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-navy-deep/5" aria-hidden />
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur"><ServiceIcon name={category.icon} className="h-6 w-6" /></span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">{items.length} service{items.length === 1 ? "" : "s"}</p>
                    <h3 className="font-display text-2xl font-semibold md:text-3xl">{category.title}</h3>
                  </div>
                </div>
                <p className="mt-3 max-w-md text-white/85">{category.blurb}</p>
              </div>
              <ul className="divide-y divide-line">
                {items.map((service) => (
                  <li key={service.id}>
                    <Link href={`/services/${service.slug}`} className="group flex items-center gap-4 px-5 py-3.5 hover:bg-mist sm:px-6">
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-mist"><Photo src={service.image} stock={serviceStock(service.slug)} fill sizes="56px" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-navy group-hover:text-brand">{service.title}</span>
                        <span className="block truncate text-sm text-slate">{service.summary}</span>
                      </span>
                      <ArrowRight className="h-5 w-5 shrink-0 text-brand transition group-hover:translate-x-1" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          </FadeIn>
        );
      })}
    </div>
  );
}

export function Pillars() {
  const items = [
    [Sunset, "Harbour sunsets", "Every harbour-facing room and suite has a balcony made for the golden hour."],
    [Waves, "Pools for every mood", "A lagoon pool for families, and private heated plunge pools in every villa."],
    [UtensilsCrossed, "Top End flavours", "Barramundi, mud crab and tropical fruit, cooked by chefs who know the region."],
    [Sparkles, "Native botanicals spa", "Treatments with Kakadu plum and lemon myrtle in a garden-view day spa."],
    [ShieldCheck, "Book direct, book better", "The best rate, free breakfast on 2+ nights and a personal confirmation."],
    [MapPin, "Darwin at your door", "Walk to the Waterfront precinct; the city, markets and Mindil are minutes away."],
  ] as const;
  return (
    <div className="grid gap-px overflow-hidden rounded-[26px] border border-navy/10 bg-navy/10 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([Icon, title, text], index) => (
        <FadeIn key={title} delay={index * 60} className="h-full">
          <article className="group relative h-full overflow-hidden bg-pearl p-8 transition duration-500 hover:bg-navy">
            <span className="absolute right-6 top-6 font-display text-sm italic text-brand transition group-hover:text-sky">{String(index + 1).padStart(2, "0")}</span>
            <span className="grid h-14 w-14 place-items-center rounded-full border border-brand/40 text-brand transition duration-500 group-hover:rotate-[360deg] group-hover:border-sky group-hover:text-sky"><Icon className="h-5 w-5" aria-hidden /></span>
            <h3 className="mt-8 font-display text-3xl font-medium text-navy transition group-hover:text-white">{title}</h3>
            <p className="mt-3 text-slate transition group-hover:text-white/70">{text}</p>
          </article>
        </FadeIn>
      ))}
    </div>
  );
}

export function Steps({ tone = "light" }: { tone?: "light" | "dark" }) {
  const steps = [
    ["Choose your dates", "Check live availability for every room type, or ask our reservations assistant."],
    ["We confirm personally", "Our team calls or emails to confirm your room, rate and any special requests."],
    ["Arrive and unwind", "Check-in from 2pm, with a welcome drink on the Saltwater deck."],
    ["Stay connected", "Message us any time on WhatsApp for transfers, tables and spa times."],
  ];
  return (
    <ol className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      <span className={cn("absolute left-0 right-0 top-[38px] hidden h-px lg:block", tone === "dark" ? "bg-white/15" : "bg-navy/15")} aria-hidden />
      {steps.map(([title, text], index) => (
        <FadeIn key={title} delay={index * 120}>
          <li className="relative">
            <span className={cn("relative z-10 grid h-[76px] w-[76px] place-items-center rounded-full border font-display text-3xl italic", tone === "dark" ? "border-white/20 bg-navy-deep text-sky" : "border-navy/15 bg-pearl text-brand")}>0{index + 1}</span>
            <h3 className={cn("mt-6 font-display text-3xl font-medium", tone === "dark" ? "text-white" : "text-navy")}>{title}</h3>
            <p className={cn("mt-3", tone === "dark" ? "text-white/70" : "text-slate")}>{text}</p>
          </li>
        </FadeIn>
      ))}
    </ol>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="border-t border-navy/15">
      {faqs.map((faq) => (
        <details key={faq.id} className="group border-b border-navy/15">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-2xl font-medium text-navy transition hover:text-brand md:text-[28px] [&::-webkit-details-marker]:hidden">
            {faq.question}
            <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-navy/20 transition duration-500 group-open:rotate-[135deg] group-open:border-navy group-open:bg-navy group-open:text-sky" aria-hidden>
              <span className="absolute h-px w-3.5 bg-current" /><span className="absolute h-3.5 w-px bg-current" />
            </span>
          </summary>
          <p className="max-w-2xl pb-7 pr-12 text-lg text-slate">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function AreaList({ areas }: { areas: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {areas.map((area) => (
        <li key={area} className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-sm text-navy"><MapPin className="h-3.5 w-3.5 text-leaf-dark" aria-hidden />{area}</li>
      ))}
    </ul>
  );
}

export function TeamVisual({ photo, className }: { photo: string; className?: string }) {
  return (
    <div className={cn("relative grid grid-cols-5 grid-rows-6 gap-3 sm:gap-4", className)}>
      <div className="relative col-span-3 row-span-6 min-h-[340px] overflow-hidden rounded-card shadow-soft sm:min-h-[460px]">
        <Photo src={photo} stock={STOCK.villa} alt="A private pool villa" fill sizes="(max-width: 1024px) 60vw, 30vw" />
      </div>
      <div className="relative col-span-2 row-span-3 overflow-hidden rounded-card shadow-card">
        <Photo stock={STOCK.spa} alt="The day spa" fill sizes="(max-width: 1024px) 40vw, 20vw" />
      </div>
      <div className="relative col-span-2 row-span-3 overflow-hidden rounded-card shadow-card">
        <Photo stock={STOCK.dining} alt="Waterfront dining" fill sizes="(max-width: 1024px) 40vw, 20vw" />
      </div>
      <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-soft sm:left-6">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-navy text-sky"><Sunset className="h-6 w-6" aria-hidden /></span>
        <span><span className="block font-display font-semibold text-navy">Locally owned</span><span className="text-sm text-slate">On the Darwin waterfront</span></span>
      </div>
    </div>
  );
}

export function CtaBand({ settings }: { settings: Settings }) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-deep py-24 text-white md:py-36">
      <Photo stock={STOCK.sunset} fill sizes="100vw" className="-z-20 animate-kenburns" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-deep/80 via-navy-deep/60 to-navy-deep" aria-hidden />
      <div className="container-x text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-sky">Your harbour escape awaits</p>
        <SplitWords text="Stay with the tide." className="mx-auto mt-6 max-w-4xl font-display text-6xl font-light leading-[0.9] tracking-[-0.04em] md:text-8xl lg:text-[128px]" />
        <p className="mx-auto mt-8 max-w-xl text-lg text-white/80" data-reveal>Check live availability and book direct for our best rate, with free breakfast on stays of two nights or more.</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Magnetic>
            <Link href="/booking" data-cursor="Book" className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-sky pl-7 pr-2 font-semibold text-navy-deep transition hover:bg-white">
              Check availability <span className="grid h-10 w-10 place-items-center rounded-full bg-navy-deep text-sky transition group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" aria-hidden /></span>
            </Link>
          </Magnetic>
          <button type="button" data-open-chat className="inline-flex min-h-14 items-center rounded-full border border-white/30 px-6 font-semibold hover:bg-white/10">Ask our concierge</button>
        </div>
        <a href={`tel:${settings.phoneTel}`} className="mt-6 inline-block text-sm uppercase tracking-[0.24em] text-white/70 hover:text-white">or call {settings.phoneDisplay}</a>
      </div>
    </section>
  );
}
