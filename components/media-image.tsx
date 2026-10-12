import Image from "next/image";

export function MediaImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={900}
      sizes="(max-width: 768px) 100vw, 720px"
      className={className}
      unoptimized={src.startsWith("http") || src.startsWith("/uploads")}
    />
  );
}
