import Link from "next/link";
import { SpinningBadge } from "@/components/page-hero";
import { Photo } from "@/components/photo";
import { STOCK } from "@/lib/stock";

export default function SiteNotFound() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-navy-deep text-white">
      <Photo stock={STOCK.sunset} fill priority sizes="100vw" className="-z-20 animate-kenburns opacity-50" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep via-navy-deep/70 to-navy-deep/40" aria-hidden />
      <SpinningBadge text="This page has checked out · " className="pointer-events-none absolute right-8 top-28 hidden h-36 w-36 text-white/50 md:block" />
      <div className="container-x pt-24 text-center">
        <p className="font-display text-[34vw] font-light leading-[0.8] tracking-[-0.06em] text-white/10 md:text-[22vw]">404</p>
        <h1 className="-mt-[8vw] font-display text-5xl font-light md:text-7xl">This page has <em className="text-sky">checked out.</em></h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-white/75">The link may be old. Explore our rooms, or ask our concierge and we’ll point you the right way.</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/services" className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/30 px-7 font-semibold hover:bg-white/10">Rooms &amp; suites</Link>
          <Link href="/booking" className="inline-flex min-h-14 items-center justify-center rounded-full bg-sky px-7 font-semibold text-navy-deep hover:bg-white">Book your stay</Link>
        </div>
      </div>
    </section>
  );
}
