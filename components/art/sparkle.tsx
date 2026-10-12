import { cn } from "@/lib/utils";

/** The four-point sparkle from the logo. Used as the brand's signature accent. */
export function Sparkle({ className, animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("inline-block", animated && "animate-twinkle", className)}>
      <path d="M12 0c.9 6.2 5.8 11.1 12 12-6.2.9-11.1 5.8-12 12-.9-6.2-5.8-11.1-12-12C6.2 11.1 11.1 6.2 12 0Z" fill="currentColor" />
    </svg>
  );
}

/** The green swoosh from the logo, as a section divider. */
export function Swoosh({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden className={className}>
      <path d="M0 50 C150 -10 420 -10 600 40" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
