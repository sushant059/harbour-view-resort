"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";
import { Photo } from "@/components/photo";
import { SceneArt } from "@/components/scene-art";
import { sceneStock } from "@/lib/stock";
import { cn } from "@/lib/utils";

type Mode = "photo" | "drawing";

function Visual({ src, scene, clean, alt, mode }: { src?: string; scene: string; clean: boolean; alt: string; mode: Mode }) {
  if (src) {
    return <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" unoptimized={src.startsWith("http") || src.startsWith("/uploads")} />;
  }
  if (mode === "drawing") return <SceneArt scene={scene} clean={clean} alt={alt} label={false} />;
  // Example photo: the "before" side is the same photo dulled and marked, to show the idea until real job photos are added.
  return (
    <div className="absolute inset-0">
      <Photo stock={sceneStock(scene)} alt={alt} fill sizes="(max-width: 768px) 100vw, 720px" className={clean ? "brightness-[1.06] saturate-[1.1]" : "brightness-[.72] contrast-[.9] saturate-[.55] sepia-[.45]"} />
      {!clean && (
        <div
          className="absolute inset-0 mix-blend-multiply"
          aria-hidden
          style={{ background: "radial-gradient(28% 18% at 30% 70%, rgba(110,80,40,.45), transparent 70%), radial-gradient(20% 14% at 68% 58%, rgba(90,70,40,.4), transparent 70%), radial-gradient(35% 22% at 55% 85%, rgba(120,95,60,.35), transparent 70%), linear-gradient(rgba(120,100,70,.18), rgba(120,100,70,.18))" }}
        />
      )}
    </div>
  );
}

export function BeforeAfter({ beforeSrc, afterSrc, scene, beforeAlt, afterAlt, className }: { beforeSrc?: string; afterSrc?: string; scene: string; beforeAlt: string; afterAlt: string; className?: string }) {
  const [value, setValue] = useState(50);
  const [mode, setMode] = useState<Mode>("photo");
  const example = !beforeSrc || !afterSrc;
  const ref = useRef<HTMLDivElement>(null);

  function setFromClientX(clientX: number) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setValue(Math.min(96, Math.max(4, ((clientX - rect.left) / rect.width) * 100)));
  }

  return (
    <div
      ref={ref}
      className={cn("group relative aspect-[4/3] w-full cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-card bg-white shadow-card ring-1 ring-line", className)}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setFromClientX(event.clientX);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId) || event.pointerType === "mouse") setFromClientX(event.clientX);
      }}
    >
      <div className="absolute inset-0"><Visual src={afterSrc} scene={scene} clean alt={afterAlt} mode={mode} /></div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
        <Visual src={beforeSrc} scene={scene} clean={false} alt={beforeAlt} mode={mode} />
      </div>
      <div className="absolute inset-y-0" style={{ left: `${value}%` }}>
        <div className="absolute inset-y-0 -ml-[2px] w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,.25)]" />
        <button
          type="button"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value)}
          aria-label="Drag to compare before and after"
          className="absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-navy shadow-soft ring-4 ring-white/40 transition group-hover:scale-110"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") setValue((current) => Math.max(4, current - 5));
            if (event.key === "ArrowRight") setValue((current) => Math.min(96, current + 5));
          }}
        >
          <ChevronsLeftRight aria-hidden />
        </button>
      </div>
      {example && (
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 p-1 text-[11px] font-bold uppercase tracking-wider shadow-card backdrop-blur" onPointerDown={(event) => event.stopPropagation()}>
          <span className="px-2 text-slate">Example</span>
          {(["photo", "drawing"] as const).map((item) => (
            <button key={item} type="button" aria-pressed={mode === item} onClick={() => setMode(item)} className={cn("rounded-full px-2.5 py-1", mode === item ? "bg-navy text-white" : "text-navy hover:bg-mist")}>
              {item === "photo" ? "Photo" : "Illustration"}
            </button>
          ))}
        </div>
      )}
      <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-navy/85 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Before</span>
      <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-leaf-dark px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">After</span>
    </div>
  );
}
