import type { Metadata } from "next";
import { CtaBand, PageHero, SectionHeading } from "@/components/content";
import { Photo } from "@/components/photo";
import { getDb } from "@/lib/store";
import { GALLERY, STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of the rooms, suites, private pool villas, restaurant, spa and events at Harbour View Resort Darwin.",
};

export default async function GalleryPage() {
  const db = await getDb();
  // The resort's own uploads (Admin → Gallery & media) come first.
  const uploads = db.media.filter((item) => item.kind === "image");
  return (
    <>
      <PageHero image={STOCK.villa} eyebrow="Gallery" title="A closer look at the resort." lede="Rooms and villas, the lagoon pool, the spa and long dinners on the deck." crumbs={[{ href: "/results", label: "Gallery" }]} />
      <section className="section pt-12">
        <div className="container-x space-y-16">
          {uploads.length > 0 && (
            <div>
              <SectionHeading eyebrow="Latest" title="From our photographers" />
              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
                {uploads.map((item) => <div key={item.id} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mist"><Photo src={item.url} alt={item.name} fill sizes="(max-width: 768px) 50vw, 33vw" /></div>)}
              </div>
            </div>
          )}
          {GALLERY.map((group) => (
            <div key={group.title}>
              <SectionHeading eyebrow="Gallery" title={group.title} />
              <div className="mt-8 grid auto-rows-[160px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-3">
                {group.images.map((image, index) => (
                  <div key={`${image.id}-${index}`} className={`relative overflow-hidden rounded-2xl bg-mist ${index === 0 ? "col-span-2 row-span-2" : ""}`}>
                    <Photo stock={[image]} alt={image.alt} fill sizes={index === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 33vw"} className="transition duration-700 hover:scale-105" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <CtaBand settings={db.settings} />
    </>
  );
}
