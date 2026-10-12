"use client";

import { useState } from "react";
import { BeforeAfter } from "@/components/before-after";
import type { ResultPair, Service } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ResultsGallery({ results, services }: { results: ResultPair[]; services: Service[] }) {
  const [filter, setFilter] = useState("all");
  const visible = results.filter((item) => filter === "all" || item.serviceSlug === filter);
  const chips = [{ slug: "all", title: "All results" }, ...services.filter((service) => results.some((item) => item.serviceSlug === service.slug)).map((service) => ({ slug: service.slug, title: service.title }))];
  return (
    <div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-6" role="toolbar" aria-label="Filter results">
        {chips.map((chip) => (
          <button key={chip.slug} type="button" aria-pressed={filter === chip.slug} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition", filter === chip.slug ? "bg-navy text-white" : "bg-mist text-navy hover:bg-brand-light")} onClick={() => setFilter(chip.slug)}>
            {chip.title}
          </button>
        ))}
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {visible.map((item) => (
          <figure key={item.id}>
            <BeforeAfter scene={item.scene || item.serviceSlug} beforeSrc={item.beforeImage} afterSrc={item.afterImage} beforeAlt={`Before: ${item.caption}`} afterAlt={`After: ${item.caption}`} />
            <figcaption className="mt-3 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-navy">{item.caption}</span>
              {item.illustrative && <span className="chip bg-mist text-xs text-slate">Illustrative example</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      {visible.length === 0 && <p className="card p-6 text-slate">No results in this filter yet.</p>}
    </div>
  );
}
