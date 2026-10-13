"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { Photo } from "@/components/photo";
import type { StockImage } from "@/lib/stock";
import type { Offer } from "@/lib/types";

function PackageCard({ offer, image, index, total }: { offer: Offer; image: StockImage[]; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9 - (total - index) * 0.01]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.55]);
  return (
    <div ref={ref} className="sticky h-[78vh] min-h-[520px]" style={{ zIndex: index + 1, top: `calc(5.5rem + ${index * 22}px)` }}>
      <motion.article style={{ scale }} className="relative grid h-[72vh] min-h-[480px] origin-top overflow-hidden rounded-[30px] bg-navy text-white shadow-soft md:grid-cols-2">
        <div className="relative min-h-[220px]">
          <Photo src={offer.image} stock={image} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="flex flex-col justify-between p-7 md:p-12">
          <div>
            <p className="font-display text-lg italic text-sky">Package {String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-4 font-display text-4xl font-medium leading-none md:text-6xl">{offer.title}</h3>
            <p className="mt-6 max-w-md text-lg text-white/75">{offer.description}</p>
          </div>
          <Link href={offer.href || "/booking"} data-cursor="Book" className="group mt-8 inline-flex items-center gap-3 self-start rounded-full bg-sky py-2 pl-6 pr-2 font-semibold text-navy-deep transition hover:bg-white">
            Claim this offer <span className="grid h-10 w-10 place-items-center rounded-full bg-navy-deep text-sky transition group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" aria-hidden /></span>
          </Link>
        </div>
        <motion.span className="pointer-events-none absolute inset-0 bg-navy-deep" style={{ opacity: dim }} aria-hidden />
      </motion.article>
    </div>
  );
}

/** Offers stack up like cards on a table as you scroll: each new one slides over the last. */
export function Packages({ offers, images }: { offers: Offer[]; images: StockImage[][] }) {
  if (!offers.length) return null;
  return (
    <section className="relative bg-[#F4EFE6] pb-24 pt-24 md:pt-32">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-brand"><span className="h-px w-10 bg-brand" /> Packages</p>
            <h2 className="mt-6 font-display text-5xl font-medium leading-[0.95] tracking-[-0.03em] text-navy md:text-7xl">Offers for <em className="font-light text-brand">direct</em> guests</h2>
          </div>
          <Link href="/offers" className="group inline-flex items-center gap-2 text-lg font-semibold text-navy">All packages <ArrowUpRight className="h-5 w-5 transition group-hover:rotate-45" aria-hidden /></Link>
        </div>
        <div className="mt-14">
          {offers.map((offer, index) => <PackageCard key={offer.id} offer={offer} image={images[index % images.length]} index={index} total={offers.length} />)}
        </div>
      </div>
    </section>
  );
}
