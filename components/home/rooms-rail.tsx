"use client";

import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BedDouble, Users } from "lucide-react";
import { Photo } from "@/components/photo";
import { serviceStock } from "@/lib/stock";
import type { Service } from "@/lib/types";

function RoomPanel({ room, index, total }: { room: Service; index: number; total: number }) {
  return (
    <Link href={`/services/${room.slug}`} data-cursor="View" className="group relative block h-full overflow-hidden rounded-[26px] bg-navy text-white">
      <div className="absolute inset-0 transition duration-[1.4s] ease-out group-hover:scale-110">
        <Photo src={room.image} stock={serviceStock(room.slug)} alt={room.title} fill sizes="(max-width: 768px) 85vw, 45vw" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/30 to-transparent" aria-hidden />
      <div className="absolute inset-0 bg-navy-deep/0 transition duration-700 group-hover:bg-navy-deep/25" aria-hidden />
      <div className="absolute left-6 right-6 top-6 flex items-start justify-between text-xs uppercase tracking-[0.3em] text-white/75">
        <span className="font-display text-base normal-case italic tracking-normal text-sky">{String(index + 1).padStart(2, "0")} <span className="text-white/45">/ {String(total).padStart(2, "0")}</span></span>
        <span className="grid h-12 w-12 place-items-center rounded-full border border-white/30 backdrop-blur transition duration-500 group-hover:rotate-45 group-hover:border-sky group-hover:bg-sky group-hover:text-navy-deep"><ArrowUpRight className="h-5 w-5" aria-hidden /></span>
      </div>
      <div className="absolute inset-x-6 bottom-6">
        <h3 className="font-display text-4xl font-medium leading-none md:text-5xl">{room.title}</h3>
        <p className="mt-3 max-w-md text-sm text-white/75 opacity-90 md:text-base">{room.summary}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-4 text-sm">
          <span className="font-display text-xl text-sky">{room.priceFrom}</span>
          {room.maxGuests > 0 && <span className="flex items-center gap-1.5 text-white/70"><Users className="h-4 w-4" aria-hidden /> Sleeps {room.maxGuests}</span>}
          {room.rooms > 0 && <span className="flex items-center gap-1.5 text-white/70"><BedDouble className="h-4 w-4" aria-hidden /> {room.rooms} {room.rooms === 1 ? "residence" : "rooms"}</span>}
        </div>
      </div>
    </Link>
  );
}

/**
 * Rooms on a pinned horizontal rail: on desktop the section holds still while vertical scrolling
 * slides the rooms sideways. Phones get a swipeable row instead.
 */
export function RoomsRail({ rooms }: { rooms: Service[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const x = useTransform(smooth, [0, 1], [0, -distance]);
  const bar = useTransform(smooth, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth + 48));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [rooms.length]);

  const intro = (
    <div className="flex w-[78vw] shrink-0 flex-col justify-between pr-6 sm:w-[46vw] lg:w-[30vw]">
      <div>
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-brand"><span className="h-px w-10 bg-brand" /> Stay</p>
        <h2 className="mt-6 font-display text-5xl font-medium leading-[0.95] tracking-[-0.03em] text-navy md:text-7xl">Rooms, suites <em className="font-light text-brand">&amp;</em> villas</h2>
        <p className="mt-6 max-w-sm text-lg text-slate">From harbour-view kings to a private pool villa. Every rate includes Wi-Fi, the lagoon pool and the gym.</p>
      </div>
      <Link href="/booking" className="group mt-8 inline-flex items-center gap-3 self-start text-lg font-semibold text-navy">
        <span className="relative">Check availability<span className="absolute -bottom-1 left-0 h-px w-full origin-left bg-navy transition duration-500 group-hover:scale-x-0" /></span>
        <ArrowUpRight className="h-5 w-5 transition group-hover:rotate-45" aria-hidden />
      </Link>
    </div>
  );

  return (
    <>
      {/* Desktop: pinned rail */}
      <section ref={ref} className="relative hidden bg-[#F4EFE6] lg:block" style={{ height: `${100 + rooms.length * 42}vh` }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <motion.div ref={track} style={{ x }} className="flex h-[72vh] items-stretch gap-6 pl-[max(2rem,calc((100vw-80rem)/2+2rem))] will-change-transform">
            {intro}
            {rooms.map((room, index) => (
              <div key={room.id} className="h-full w-[44vw] shrink-0 xl:w-[38vw]">
                <RoomPanel room={room} index={index} total={rooms.length} />
              </div>
            ))}
            <div className="w-8 shrink-0" />
          </motion.div>
          <div className="container-x mt-8 flex items-center gap-6">
            <span className="text-xs uppercase tracking-[0.3em] text-slate">Scroll</span>
            <div className="relative h-px flex-1 bg-navy/15"><motion.div className="absolute inset-y-0 left-0 bg-navy" style={{ width: bar }} /></div>
            <span className="font-display italic text-navy">{rooms.length} ways to stay</span>
          </div>
        </div>
      </section>

      {/* Phones & tablets: swipe */}
      <section className="bg-[#F4EFE6] py-20 lg:hidden">
        <div className="container-x">{intro}</div>
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6">
          {rooms.map((room, index) => (
            <motion.div key={room.id} className="h-[520px] w-[84%] shrink-0 snap-center sm:w-[60%]" initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}>
              <RoomPanel room={room} index={index} total={rooms.length} />
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
