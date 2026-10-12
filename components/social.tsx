import type { Settings } from "@/lib/types";
import { cn, safeHttpUrl, waLink } from "@/lib/utils";

type Network = { key: string; label: string; href: string; path: React.ReactNode; color: string };

const P = {
  facebook: <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21Z" />,
  instagram: (
    <>
      <path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
      <circle cx="16.9" cy="7.1" r="1.1" />
      <path d="M12 3.6c2.7 0 3 0 4.1.1 2.7.1 4 1.4 4.1 4.1.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 2.7-1.4 4-4.1 4.1-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-2.7-.1-4-1.4-4.1-4.1-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1c.1-2.7 1.4-4 4.1-4.1 1.1-.1 1.4-.1 4.1-.1Zm0-1.6c-2.7 0-3.1 0-4.1.1C4.2 2.2 2.2 4.2 2.1 7.9 2 8.9 2 9.3 2 12s0 3.1.1 4.1c.2 3.7 2.2 5.7 5.8 5.8 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c3.7-.2 5.7-2.2 5.8-5.8.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.2-3.7-2.2-5.7-5.8-5.8C15.1 2 14.7 2 12 2Z" />
    </>
  ),
  tiktok: <path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.8 5.8 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z" />,
  whatsapp: <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1 0-.3-.1-.6-.2Z" />,
  youtube: <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3Z" />,
  google: <path d="M21.4 10.2H12v3.9h5.4c-.5 2.5-2.6 3.9-5.4 3.9a6 6 0 1 1 3.9-10.5l2.9-2.9A10 10 0 1 0 12 22c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.3-.2-2Z" />,
};

export function BrandIcon({ name, className }: { name: keyof typeof P; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      {P[name]}
    </svg>
  );
}

/** Profile links come from admin Settings. Until one is added the icon opens the network's home page. */
export function socialLinks(settings: Settings): Network[] {
  const pick = (value: string, fallback: string) => safeHttpUrl(value) || fallback;
  return [
    { key: "facebook", label: "Facebook", href: pick(settings.facebook, "https://www.facebook.com/"), path: P.facebook, color: "#1877F2" },
    { key: "instagram", label: "Instagram", href: pick(settings.instagram, "https://www.instagram.com/"), path: P.instagram, color: "#E4405F" },
    { key: "tiktok", label: "TikTok", href: pick(settings.tiktok, "https://www.tiktok.com/"), path: P.tiktok, color: "#000000" },
    { key: "whatsapp", label: "WhatsApp", href: whatsappHref(settings), path: P.whatsapp, color: "#25D366" },
    ...(safeHttpUrl(settings.youtube) ? [{ key: "youtube", label: "YouTube", href: settings.youtube, path: P.youtube, color: "#FF0000" }] : []),
    { key: "google", label: "Google reviews", href: pick(settings.google, "https://www.google.com/maps"), path: P.google, color: "#4285F4" },
  ];
}

export function whatsappHref(settings: Settings, text?: string) {
  if (!text && safeHttpUrl(settings.whatsappUrl)) return settings.whatsappUrl;
  return waLink(settings.phoneTel, text || `Hi ${settings.shortName}, I'd like to book a stay.`);
}

export function SocialIcons({ settings, tone = "light", size = "md", className }: { settings: Settings; tone?: "light" | "dark" | "color"; size?: "sm" | "md"; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)} aria-label="Follow Harbour View Resort">
      {socialLinks(settings).map((item) => (
        <li key={item.key}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            title={item.label}
            style={tone === "color" ? { backgroundColor: item.color } : undefined}
            className={cn(
              "grid place-items-center rounded-full transition hover:-translate-y-0.5",
              size === "sm" ? "h-8 w-8" : "h-11 w-11",
              tone === "light" && "bg-white/10 text-white hover:bg-white hover:text-navy",
              tone === "dark" && "bg-brand-light text-navy hover:bg-navy hover:text-white",
              tone === "color" && "text-white shadow-card",
            )}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={size === "sm" ? "h-4 w-4" : "h-5 w-5"}>
              {item.path}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
