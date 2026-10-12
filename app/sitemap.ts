import type { MetadataRoute } from "next";
import { getDb } from "@/lib/store";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb();
  const paths = ["", "/services", "/why-us", "/how-it-works", "/booking", "/free-quote", "/results", "/offers", "/reviews", "/faqs", "/contact", "/privacy", "/terms", ...db.services.filter((service) => service.visible).map((service) => `/services/${service.slug}`)];
  return paths.map((path) => ({ url: `${siteUrl()}${path || "/"}`, lastModified: new Date() }));
}
