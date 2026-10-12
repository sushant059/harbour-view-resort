"use client";

import { useEffect, useRef, useState } from "react";
import { pexelsSrcSet, pexelsUrl, type StockClip, type StockImage } from "@/lib/stock";
import { cn, filled } from "@/lib/utils";

type Candidate = { src: string; srcSet?: string; alt: string };

function candidates(own: string | undefined, ownAlt: string, stock: StockImage[]): Candidate[] {
  const list: Candidate[] = [];
  if (filled(own ?? "")) list.push({ src: own!, alt: ownAlt });
  for (const item of stock) list.push({ src: pexelsUrl(item.id), srcSet: pexelsSrcSet(item.id), alt: ownAlt || item.alt });
  return list;
}

/**
 * A photo that never shows as broken: the admin's own upload first, then stock photos, then a brand gradient.
 * Fills its parent (absolute) when `fill` is set, otherwise behaves like an <img>.
 */
export function Photo({
  src,
  stock = [],
  alt = "",
  className,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  fill = false,
}: {
  src?: string;
  stock?: StockImage[];
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  const list = candidates(src, alt, stock);
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLImageElement>(null);
  const current = list[index];

  // An image can fail before React hydrates and attaches onError, so check once on mount.
  useEffect(() => {
    const image = ref.current;
    if (image && image.complete && image.naturalWidth === 0) setIndex((value) => value + 1);
  }, [index]);

  const box = cn(fill && "absolute inset-0 h-full w-full", "object-cover", className);
  if (!current) return <span className={cn(box, "block bg-gradient-to-br from-brand via-navy-soft to-navy")} role={alt ? "img" : undefined} aria-label={alt || undefined} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      key={current.src}
      src={current.src}
      srcSet={current.srcSet}
      sizes={current.srcSet ? sizes : undefined}
      alt={current.alt}
      className={box}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      onError={() => setIndex((value) => value + 1)}
    />
  );
}

/** Muted, looping background clip. Plays only when on screen and when the visitor allows motion. */
export function BackgroundVideo({ clip, src, className }: { clip: StockClip; src?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    setAllowed(!reduce && !saveData);
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video || !allowed) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => undefined);
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [allowed]);

  const sources = [...(filled(src ?? "") ? [src!] : []), ...clip.sources];
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden>
      <Photo stock={[{ id: clip.poster, alt: "" }]} fill className="animate-kenburns" priority sizes="100vw" />
      {allowed && !failed && (
        <video ref={ref} className="absolute inset-0 h-full w-full object-cover" muted loop playsInline preload="metadata" poster={pexelsUrl(clip.poster, 1280)}>
          {sources.map((source, index) => (
            <source key={source} src={source} type="video/mp4" onError={index === sources.length - 1 ? () => setFailed(true) : undefined} />
          ))}
        </video>
      )}
    </div>
  );
}

/** A click-to-play clip with controls, for galleries. Falls back to its poster photo. */
export function ClipPlayer({ clip, src, title, className }: { clip: StockClip; src?: string; title: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const sources = [...(filled(src ?? "") ? [src!] : []), ...clip.sources];
  if (failed) {
    return (
      <div className={cn("relative aspect-video overflow-hidden bg-navy-deep", className)}>
        <Photo stock={[{ id: clip.poster, alt: title }]} fill className="animate-kenburns" />
        <span className="absolute bottom-3 left-3 rounded-full bg-navy/85 px-3 py-1.5 text-xs font-semibold text-white">Video coming soon</span>
      </div>
    );
  }
  return (
    <div className={cn("relative aspect-video overflow-hidden bg-navy-deep", className)}>
      <video className="h-full w-full object-cover" controls playsInline muted preload="none" poster={pexelsUrl(clip.poster, 1280)} title={title}>
        {sources.map((source, index) => (
          <source key={source} src={source} type="video/mp4" onError={index === sources.length - 1 ? () => setFailed(true) : undefined} />
        ))}
      </video>
    </div>
  );
}
