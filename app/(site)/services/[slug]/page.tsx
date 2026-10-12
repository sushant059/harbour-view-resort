import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, MessageSquareText, Phone, Tag } from "lucide-react";
import { CtaBand, FaqList, PageHero, ReviewCard, SectionHeading, ServiceCard } from "@/components/content";
import { PhotoGallery } from "@/components/gallery";
import { Photo } from "@/components/photo";
import { VideoPlayer } from "@/components/video";
import { whatsappHref } from "@/components/social";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { getDb } from "@/lib/store";
import { serviceGalleryStock, serviceStock } from "@/lib/stock";
import { byOrder, cn, filled, siteUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const service = db.services.find((item) => item.slug === slug && item.visible);
  if (!service) return { title: "Service" };
  return { title: `${service.title} in Darwin`, description: service.summary, openGraph: service.image ? { images: [service.image] } : undefined };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const service = db.services.find((item) => item.slug === slug && item.visible);
  if (!service) notFound();
  const category = SERVICE_CATEGORIES.find((item) => item.id === service.category);
  const related = byOrder(db.services).filter((item) => item.visible && item.slug !== service.slug && (service.related.includes(item.slug) || item.category === service.category)).slice(0, 3);
  const results = byOrder(db.results).filter((item) => item.serviceSlug === service.slug);
  const reviews = db.reviews.filter((review) => review.status === "approved" && review.service.toLowerCase() === service.title.toLowerCase()).slice(0, 2);
  const s = db.settings;
  const isRoom = service.rooms > 0;
  const primaryHref = isRoom ? `/booking?service=${service.slug}` : `/free-quote?service=${service.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    provider: { "@type": "LocalBusiness", name: s.businessName, telephone: s.phoneTel },
    areaServed: "Darwin, Northern Territory",
    url: `${siteUrl()}/services/${service.slug}`,
  };
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero image={serviceStock(service.slug)} src={service.image} eyebrow={category?.title ?? "Service"} title={service.title} lede={service.summary} crumbs={[{ href: "/services", label: "Rooms & suites" }, ...(category ? [{ href: `/services#${category.id}`, label: category.title }] : []), { href: `/services/${service.slug}`, label: service.title }]}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={primaryHref} className="inline-flex min-h-14 items-center justify-center rounded-full bg-leaf px-7 font-semibold text-navy-deep hover:bg-sun">{isRoom ? "Check availability" : "Enquire now"}</Link>
          <button type="button" data-open-chat className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/50 px-7 font-semibold text-white hover:bg-white/10">Ask our concierge</button>
        </div>
      </PageHero>

      <div className="container-x grid gap-10 py-14 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-16">
          {/* Video */}
          <section aria-labelledby="video-heading">
            <h2 id="video-heading" className="sr-only">Video</h2>
            <div className="overflow-hidden rounded-card shadow-soft ring-1 ring-line">
              <VideoPlayer url={service.videoUrl} poster={service.image} title={`${service.title} at Harbour View Resort`} scene={service.slug} />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow={isRoom ? "About this room" : "About"} title={isRoom ? "Your space" : "What to expect"} />
            <p className="mt-4 text-lg leading-relaxed text-slate">{service.description}</p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="card p-6">
                <h3 className="font-display text-xl font-semibold text-navy">{isRoom ? "In your room" : "What’s included"}</h3>
                <ul className="mt-4 space-y-3">{service.included.map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-leaf-dark" aria-hidden />{item}</li>)}</ul>
              </div>
              <div className="card p-6">
                <h3 className="font-display text-xl font-bold text-navy">Perfect for</h3>
                <ul className="mt-4 space-y-3">{service.bestFor.map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />{item}</li>)}</ul>
              </div>
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Booking" title="How your stay works" />
            <ol className="mt-8 space-y-2">
              {service.process.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand font-display font-bold text-white">{index + 1}</span>
                    {index < service.process.length - 1 && <span className="mt-2 w-0.5 flex-1 rounded bg-line" aria-hidden />}
                  </div>
                  <div className="pb-6">
                    <h3 className="font-display text-xl font-bold text-navy">{step.title}</h3>
                    <p className="mt-1 text-slate">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <SectionHeading eyebrow="Gallery" title="Take a look" />
            <div className="mt-8">
              {service.gallery.length > 0 ? (
                <PhotoGallery images={service.gallery} title={service.title} />
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {serviceGalleryStock(service.slug).map((item, index) => (
                    <div key={item.id} className={cn("relative overflow-hidden rounded-2xl bg-mist", index === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square")}>
                      <Photo stock={[item]} alt={item.alt} fill sizes={index === 0 ? "(max-width: 768px) 100vw, 40vw" : "(max-width: 768px) 50vw, 20vw"} className="transition duration-700 hover:scale-105" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {reviews.length > 0 && (
            <section>
              <SectionHeading eyebrow="Reviews" title={`What customers say about ${service.title.toLowerCase()}`} />
              <div className="mt-8 grid gap-5 md:grid-cols-2">{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div>
            </section>
          )}

          {service.faqs.length > 0 && (
            <section>
              <SectionHeading eyebrow="FAQs" title="Good to know" />
              <div className="mt-8"><FaqList faqs={service.faqs.map((faq, index) => ({ id: `${service.id}-${index}`, category: service.title, question: faq.question, answer: faq.answer, order: index }))} /></div>
            </section>
          )}
        </div>

        {/* Sticky side card */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card overflow-hidden">
            <div className="bg-navy p-6 text-white">
              <p className="text-sm font-semibold text-sky-soft">{category?.title}</p>
              <p className="mt-1 font-display text-2xl font-semibold">{service.title}</p>
            </div>
            <dl className="divide-y divide-line px-6">
              <div className="flex items-center justify-between gap-3 py-4"><dt className="flex items-center gap-2 text-slate"><Tag className="h-4 w-4" aria-hidden /> {isRoom ? "Rate" : "Price"}</dt><dd className="text-right font-bold text-navy">{filled(service.priceFrom) ? `From ${service.priceFrom}` : "On request"}</dd></div>
              <div className="flex items-center justify-between gap-3 py-4"><dt className="flex items-center gap-2 text-slate"><Clock className="h-4 w-4" aria-hidden /> {isRoom ? "Sleeps" : "Details"}</dt><dd className="text-right font-bold text-navy">{filled(service.duration) ? service.duration.replace(/^Sleeps /, isRoom ? "Up to " : "Sleeps ") : "Ask us"}</dd></div>
            </dl>
            <div className="grid gap-3 p-6 pt-2">
              <Link href={primaryHref} className="inline-flex min-h-12 items-center justify-center rounded-full bg-navy font-semibold text-white hover:bg-navy-deep">{isRoom ? "Check availability" : "Enquire now"}</Link>
              <button type="button" data-open-chat className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-light font-semibold text-brand hover:bg-sky-soft"><MessageSquareText className="h-4 w-4" aria-hidden /> Ask in chat</button>
              <a href={whatsappHref(s, `Hi Harbour View Resort, I'd like to ask about the ${service.title}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-line font-bold text-navy hover:border-whatsapp">WhatsApp us</a>
              <a href={`tel:${s.phoneTel}`} className="mt-1 flex items-center justify-center gap-2 text-sm font-semibold text-slate hover:text-navy"><Phone className="h-4 w-4" aria-hidden /> {s.phoneDisplay}</a>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section bg-mist">
          <div className="container-x">
            <SectionHeading eyebrow="You might also like" title="More to explore" action={<Link href="/services" className="link-arrow">Rooms & experiences <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />
            <div className="mt-8 grid gap-5 md:grid-cols-3">{related.map((item) => <ServiceCard key={item.id} service={item} />)}</div>
          </div>
        </section>
      )}
      <CtaBand settings={s} />
    </article>
  );
}
