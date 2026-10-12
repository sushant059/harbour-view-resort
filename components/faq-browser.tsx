"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FaqList } from "@/components/content";
import type { Faq } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FaqBrowser({ faqs }: { faqs: Faq[] }) {
  const categories = ["All", ...Array.from(new Set(faqs.map((faq) => faq.category)))];
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((faq) => (category === "All" || faq.category === category) && (!q || `${faq.question} ${faq.answer}`.toLowerCase().includes(q)));
  }, [faqs, category, query]);
  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate" aria-hidden />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions, e.g. drying, pets, bond" aria-label="Search FAQs" className="min-h-14 w-full rounded-full border border-line bg-white pl-12 pr-4 text-lg shadow-card focus:border-brand focus:outline-none focus:ring-4 focus:ring-sky/20" />
      </div>
      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-4" role="toolbar" aria-label="FAQ categories">
        {categories.map((item) => (
          <button key={item} type="button" aria-pressed={category === item} className={cn("shrink-0 rounded-full px-4 py-2 font-semibold transition", category === item ? "bg-navy text-white" : "bg-mist text-navy hover:bg-brand-light")} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="mt-2"><FaqList faqs={visible} /></div>
      {visible.length === 0 && <p className="card mt-2 p-6 text-slate">No matches. Try another word, or ask in the chat.</p>}
    </div>
  );
}
