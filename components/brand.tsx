import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ tone = "dark", className, compact = false, collapse = false }: { tone?: "dark" | "light"; className?: string; compact?: boolean; collapse?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)} aria-label="Harbour View Resort Darwin home">
      <Image src="/hvr-mark.svg" alt="" width={46} height={46} priority className="h-11 w-11 shrink-0 transition group-hover:rotate-[-6deg]" />
      {!compact && (
        <span className={cn("whitespace-nowrap leading-none", collapse && "hidden sm:block")}>
          <span className={cn("block font-display text-[21px] font-semibold tracking-tight", tone === "dark" ? "text-navy" : "text-white")}>Harbour View</span>
          <span className={cn("mt-1 block text-[10px] font-semibold uppercase tracking-[0.34em]", tone === "dark" ? "text-brand" : "text-sky")}>Resort · Darwin</span>
        </span>
      )}
    </Link>
  );
}
