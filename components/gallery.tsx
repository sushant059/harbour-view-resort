"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function PhotoGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  useEffect(() => {
    if (index === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIndex(null);
      if (event.key === "ArrowRight") setIndex((value) => (value === null ? null : (value + 1) % images.length));
      if (event.key === "ArrowLeft") setIndex((value) => (value === null ? null : (value - 1 + images.length) % images.length));
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [index, images.length]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((src, i) => (
          <li key={src} className={i === 0 ? "col-span-2 row-span-2" : ""}>
            <button type="button" onClick={() => setIndex(i)} className="group relative block aspect-square h-full w-full overflow-hidden rounded-2xl bg-mist" aria-label={`Open photo ${i + 1} of ${images.length}`}>
              <Image src={src} alt={`${title} photo ${i + 1}`} fill sizes="(max-width: 768px) 50vw, 400px" className="object-cover transition duration-500 group-hover:scale-105" unoptimized={src.startsWith("http") || src.startsWith("/uploads")} />
            </button>
          </li>
        ))}
      </ul>
      {index !== null && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-navy-deep/95 p-4" role="dialog" aria-modal="true" aria-label={`${title} photos`} onClick={() => setIndex(null)}>
          <div className="relative h-[80vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <Image src={images[index]} alt={`${title} photo ${index + 1}`} fill sizes="100vw" className="object-contain" unoptimized={images[index].startsWith("http") || images[index].startsWith("/uploads")} />
          </div>
          <button type="button" className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Close" onClick={() => setIndex(null)}><X aria-hidden /></button>
          {images.length > 1 && (
            <>
              <button type="button" className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Previous photo" onClick={(event) => { event.stopPropagation(); setIndex((index - 1 + images.length) % images.length); }}><ChevronLeft aria-hidden /></button>
              <button type="button" className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Next photo" onClick={(event) => { event.stopPropagation(); setIndex((index + 1) % images.length); }}><ChevronRight aria-hidden /></button>
            </>
          )}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">{index + 1} / {images.length}</p>
        </div>
      )}
    </>
  );
}
