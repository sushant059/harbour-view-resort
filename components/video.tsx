import { Play } from "lucide-react";
import { ClipPlayer } from "@/components/photo";
import { SceneArt } from "@/components/scene-art";
import { clipFor } from "@/lib/stock";
import { parseVideo } from "@/lib/video";
import { cn } from "@/lib/utils";

/** An animated stand-in: a cleaning wand sweeps across and reveals the clean side. */
export function AnimatedPreview({ scene, className, label = true }: { scene: string; className?: string; label?: boolean }) {
  return (
    <div className={cn("relative aspect-video overflow-hidden bg-mist", className)}>
      <div className="absolute inset-0"><SceneArt scene={scene} clean={false} alt="" /></div>
      <div className="absolute inset-0 animate-reveal"><SceneArt scene={scene} clean alt="" /></div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full animate-sweep" aria-hidden>
        <div className="absolute bottom-[12%] left-0 h-[46%] w-2 rounded-full bg-gradient-to-b from-slate/30 to-slate/70" style={{ transform: "rotate(12deg)" }} />
        <div className="absolute bottom-[9%] -left-6 h-5 w-16 rounded-md bg-brand shadow-card" />
      </div>
      {label && (
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-navy/85 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-leaf" /> Animated preview · real job video coming soon
        </span>
      )}
    </div>
  );
}

export function VideoPlayer({ url, poster, title, scene, className }: { url: string; poster?: string; title: string; scene: string; className?: string }) {
  const video = parseVideo(url);
  if (video.kind === "iframe") {
    return (
      <div className={cn("relative overflow-hidden bg-navy-deep", video.vertical ? "mx-auto aspect-[9/16] max-h-[640px] max-w-[360px]" : "aspect-video", className)}>
        <iframe src={video.src} title={title} className="absolute inset-0 h-full w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      </div>
    );
  }
  if (video.kind === "file") {
    return (
      <div className={cn("relative aspect-video overflow-hidden bg-navy-deep", className)}>
        <video className="h-full w-full object-cover" controls playsInline preload="metadata" poster={poster || undefined} title={title}>
          <source src={video.src} />
        </video>
      </div>
    );
  }
  if (video.kind === "link") {
    return (
      <a href={video.src} target="_blank" rel="noopener noreferrer" className={cn("group relative block aspect-video overflow-hidden", className)}>
        <AnimatedPreview scene={scene} label={false} className="h-full" />
        <span className="absolute inset-0 grid place-items-center bg-navy/40">
          <span className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 font-bold text-navy shadow-soft transition group-hover:scale-105">
            <Play className="h-5 w-5 fill-current" aria-hidden /> Watch on {video.provider}
          </span>
        </span>
      </a>
    );
  }
  // No video of their own yet: show free stock footage for now.
  return <ClipPlayer clip={clipFor(scene)} title={title} className={className} />;
}
