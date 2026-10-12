import type { Metadata } from "next";
import { GoogleReviewButton, PageHero, ReviewCard, Stars } from "@/components/content";
import { ReviewForm } from "@/components/forms/review-form";
import { getDb } from "@/lib/store";
import { byOrder, safeHttpUrl } from "@/lib/utils";
import { STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Customer reviews",
  description: "Read reviews from guests of Harbour View Resort Darwin, or leave your own.",
};

export default async function ReviewsPage() {
  const db = await getDb();
  const reviews = byOrder(db.reviews).filter((review) => review.status === "approved");
  const real = reviews.filter((review) => review.source !== "sample");
  const average = real.length ? real.reduce((sum, review) => sum + review.rating, 0) / real.length : 0;
  const googleUrl = safeHttpUrl(db.settings.google) || `https://www.google.com/maps/search/${encodeURIComponent(`${db.settings.businessName} Darwin`)}`;
  return (
    <>
      <PageHero image={STOCK.pool} eyebrow="Reviews" title="Words from our guests." lede="Every review is from a real guest and checked by our team before it goes live." crumbs={[{ href: "/reviews", label: "Reviews" }]}>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {real.length >= 3 && (
            <div className="flex items-center gap-3 rounded-full bg-white/10 px-5 py-3 ring-1 ring-white/15">
              <span className="font-display text-3xl font-semibold">{average.toFixed(1)}</span>
              <span><Stars rating={Math.round(average)} /><span className="block text-xs text-white/70">from {real.length} reviews</span></span>
            </div>
          )}
          <a href="#write" className="inline-flex min-h-12 items-center rounded-full bg-leaf-dark px-6 font-bold text-white hover:bg-[#1d6a19]">Write a review</a>
          <GoogleReviewButton settings={db.settings} className="border-transparent" />
        </div>
      </PageHero>
      <section className="section pt-12">
        <div className="container-x">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
          </div>
          {reviews.length === 0 && <p className="card p-6 text-slate">No reviews yet. Yours could be the first!</p>}
        </div>
      </section>
      <section id="write" className="section scroll-mt-24 bg-mist">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="eyebrow">Your turn</p>
            <h2 className="h-section mt-3">Stayed with us? Tell us how it went.</h2>
            <p className="lede">Your review goes to our team first. Once it’s approved it appears here. You can share it on Google too, which helps other Darwin locals find us.</p>
          </div>
          <ReviewForm services={byOrder(db.services).filter((service) => service.visible).map((service) => service.title)} googleUrl={googleUrl} />
        </div>
      </section>
    </>
  );
}
