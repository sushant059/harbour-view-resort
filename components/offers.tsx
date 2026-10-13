import Link from "next/link";
import { ArrowRight, CalendarClock, Tag } from "lucide-react";
import { MediaImage } from "@/components/media-image";
import { Sparkle } from "@/components/art/sparkle";
import type { Offer } from "@/lib/types";
import { cn, filled, formatDisplayDate } from "@/lib/utils";

export function OfferCard({ offer, featured = false }: { offer: Offer; featured?: boolean }) {
  return (
    <article className={cn("group relative flex h-full flex-col overflow-hidden rounded-card", featured ? "bg-gradient-to-br from-navy to-navy-deep text-white ring-1 ring-sky/30" : "card")}>
      {filled(offer.image) ? (
        <MediaImage src={offer.image} alt="" className="aspect-[16/8] w-full object-cover" />
      ) : (
        featured && <Sparkle className="absolute -right-6 -top-6 h-32 w-32 text-white/10" />
      )}
      <div className="flex flex-1 flex-col p-6">
        <span className={cn("chip w-fit", featured ? "bg-sky/15 text-sky" : "bg-sun-soft text-[#8A5A00]")}><Tag className="h-3.5 w-3.5" aria-hidden /> Offer</span>
        <h3 className={cn("mt-3 font-display text-2xl font-semibold", featured ? "text-white" : "text-navy")}>{offer.title}</h3>
        <p className={cn("mt-2 flex-1", featured ? "text-white/80" : "text-slate")}>{offer.description}</p>
        {filled(offer.endsAt) && (
          <p className={cn("mt-4 flex items-center gap-2 text-sm font-semibold", featured ? "text-white/80" : "text-slate")}><CalendarClock className="h-4 w-4" aria-hidden /> Ends {formatDisplayDate(offer.endsAt)}</p>
        )}
        <Link href={offer.href || "/booking"} className={cn("mt-5 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 font-bold transition", featured ? "bg-sky text-navy-deep hover:bg-white" : "bg-navy text-white hover:bg-navy-deep")}>
          Claim this offer <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
