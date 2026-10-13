import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand";
import { FooterWordmark } from "@/components/layout/footer-wordmark";
import { wavePath } from "@/components/motion/svg";
import { SocialIcons } from "@/components/social";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import type { Service, Settings } from "@/lib/types";
import { byOrder, filled } from "@/lib/utils";

export function Footer({ settings, services }: { settings: Settings; services: Service[] }) {
  const visible = byOrder(services).filter((service) => service.visible);
  return (
    <footer className="relative overflow-hidden bg-navy-deep text-white">
      {/* A moving tide line along the top edge */}
      <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="block h-8 w-full text-sky/40" aria-hidden>
        <g className="animate-wave-slow" stroke="currentColor" fill="none" strokeWidth="1"><path d={wavePath(20, 80, 10)} /></g>
      </svg>
      <div className="container-x relative">
        <div className="grid gap-12 border-b border-white/10 pb-14 pt-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-sky">Reservations</p>
            <p className="mt-6 max-w-xl font-display text-4xl font-light leading-[1.05] md:text-6xl">Your table, your villa, your <em className="text-sky">sunset</em>. Let us arrange it.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/booking" className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-sky pl-6 pr-2 font-semibold text-navy-deep transition hover:bg-white">
                Book your stay <span className="grid h-10 w-10 place-items-center rounded-full bg-navy-deep text-sky transition group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" aria-hidden /></span>
              </Link>
              <button type="button" data-open-chat className="inline-flex min-h-14 items-center rounded-full border border-white/25 px-6 font-semibold hover:border-white">Ask our concierge</button>
            </div>
          </div>
          <ul className="grid content-end gap-4 text-sm">
            <li><a className="group flex items-center gap-4 border-b border-white/10 pb-4 hover:text-sky" href={`tel:${settings.phoneTel}`}><Phone className="h-4 w-4 text-sky" aria-hidden /><span className="font-display text-2xl">{settings.phoneDisplay}</span><ArrowUpRight className="ml-auto h-4 w-4 transition group-hover:rotate-45" aria-hidden /></a></li>
            <li><a className="group flex items-center gap-4 border-b border-white/10 pb-4 hover:text-sky" href={`mailto:${settings.email}`}><Mail className="h-4 w-4 shrink-0 text-sky" aria-hidden /><span className="break-all font-display text-xl">{settings.email}</span><ArrowUpRight className="ml-auto h-4 w-4 shrink-0 transition group-hover:rotate-45" aria-hidden /></a></li>
            <li className="flex items-center gap-4 text-white/75"><MapPin className="h-4 w-4 text-sky" aria-hidden />{filled(settings.address) ? settings.address : "Darwin Waterfront, NT"}</li>
          </ul>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo tone="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">A small luxury resort on the Darwin Waterfront. Harbour views, private pool villas and long Top End sunsets.</p>
            <SocialIcons settings={settings} className="mt-6" />
          </div>
          {SERVICE_CATEGORIES.slice(0, 2).map((_, index) => (
            <div key={index}>
              {SERVICE_CATEGORIES.filter((__, i) => i % 2 === index).map((group) => (
                <div key={group.id} className="mb-6">
                  <Link href={`/services#${group.id}`} className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky hover:text-white">{group.title}</Link>
                  <ul className="mt-3 space-y-2 text-white/70">
                    {visible.filter((service) => service.category === group.id).map((service) => (
                      <li key={service.id}><Link className="transition hover:pl-1 hover:text-white" href={`/services/${service.slug}`}>{service.title}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky">Explore</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-white/70 lg:grid-cols-1">
              {[
                ["/why-us", "The resort"],
                ["/how-it-works", "Plan your stay"],
                ["/results", "Gallery"],
                ["/offers", "Packages"],
                ["/reviews", "Reviews"],
                ["/faqs", "FAQs"],
                ["/contact", "Contact"],
              ].map(([href, label]) => (
                <li key={href}><Link className="transition hover:pl-1 hover:text-white" href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <FooterWordmark />

      <div className="container-x relative">
        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs uppercase tracking-[0.2em] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.businessName}{filled(settings.abn) ? ` · ABN ${settings.abn}` : ""}</p>
          <p className="flex gap-5"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link><span>12°27′S 130°50′E</span></p>
        </div>
      </div>
    </footer>
  );
}
