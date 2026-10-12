import Link from "next/link";
import { Sparkle } from "@/components/art/sparkle";

export default function SiteNotFound() {
  return (
    <section className="container-x py-24 text-center">
      <Sparkle className="mx-auto h-12 w-12 text-sky" animated />
      <p className="mt-6 font-display text-7xl font-semibold text-navy">404</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-navy">This page has checked out.</h1>
      <p className="mx-auto mt-3 max-w-md text-slate">The link may be old. Explore our rooms, or ask our concierge and we’ll point you the right way.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/services" className="inline-flex min-h-12 items-center justify-center rounded-full bg-navy px-6 font-bold text-white">Our services</Link>
        <Link href="/booking" className="inline-flex min-h-12 items-center justify-center rounded-full bg-navy px-6 font-semibold text-white">Book your stay</Link>
      </div>
    </section>
  );
}
