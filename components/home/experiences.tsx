"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Photo } from "@/components/photo";
import { serviceStock } from "@/lib/stock";
import type { Service } from "@/lib/types";

/**
 * A big typographic list. On desktop, a photo of each experience floats after the cursor as you
 * hover its name; on phones each row shows its photo inline.
 */
export function ExperienceList({ items }: { items: Service[] }) {
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 160, damping: 22, mass: 0.6 });

  return (
    <section className="relative overflow-hidden bg-[#F4EFE6] py-24 md:py-36" onPointerMove={(event) => { x.set(event.clientX); y.set(event.clientY); }}>
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-brand"><span className="h-px w-10 bg-brand" /> Experience</p>
            <h2 className="mt-6 font-display text-5xl font-medium leading-[0.95] tracking-[-0.03em] text-navy md:text-7xl">Dine, unwind <em className="font-light text-brand">&amp;</em> celebrate</h2>
          </div>
          <p className="max-w-sm text-lg text-slate">Long lunches by the water, rituals with native botanicals and celebrations under the Top End sky.</p>
        </div>

        <ul className="mt-16 border-t border-navy/15" onPointerLeave={() => setActive(null)}>
          {items.map((item, index) => (
            <li key={item.id} onPointerEnter={(event) => event.pointerType === "mouse" && setActive(index)}>
              <Link href={`/services/${item.slug}`} data-cursor="Discover" className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-navy/15 py-6 md:gap-10 md:py-9">
                <span className="font-display text-sm italic text-brand md:text-base">{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="block font-display text-[34px] font-medium leading-none tracking-[-0.02em] text-navy transition duration-500 group-hover:translate-x-4 group-hover:text-brand sm:text-5xl lg:text-[84px]">{item.title}</span>
                  <span className="mt-3 block max-w-xl text-slate md:text-lg">{item.summary}</span>
                </span>
                <span className="flex items-center gap-4">
                  <span className="hidden text-right font-display text-lg text-navy/70 md:block">{item.priceFrom}</span>
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-navy/20 text-navy transition duration-500 group-hover:rotate-45 group-hover:border-navy group-hover:bg-navy group-hover:text-sky md:h-16 md:w-16"><ArrowUpRight className="h-5 w-5" aria-hidden /></span>
                </span>
                <span className="absolute inset-x-0 bottom-[-1px] h-px origin-left scale-x-0 bg-navy transition duration-700 group-hover:scale-x-100" aria-hidden />
                <span className="relative col-span-3 mt-2 block aspect-[16/9] overflow-hidden rounded-[18px] lg:hidden">
                  <Photo src={item.image} stock={serviceStock(item.slug)} alt="" fill sizes="100vw" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* The floating photo that follows the cursor */}
      <motion.div className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[300px] w-[240px] lg:block" style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }} aria-hidden>
        <AnimatePresence>
          {active !== null && (
            <motion.div key={active} className="absolute inset-0 overflow-hidden rounded-[20px] shadow-soft" initial={{ opacity: 0, scale: 0.6, rotate: -8, clipPath: "inset(50% 50% 50% 50%)" }} animate={{ opacity: 1, scale: 1, rotate: 0, clipPath: "inset(0% 0% 0% 0%)" }} exit={{ opacity: 0, scale: 0.85, rotate: 6 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
              <Photo src={items[active].image} stock={serviceStock(items[active].slug)} fill sizes="240px" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
