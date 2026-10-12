export type VideoSource =
  | { kind: "iframe"; src: string; vertical: boolean; provider: string }
  | { kind: "file"; src: string }
  | { kind: "link"; src: string; provider: string }
  | { kind: "none" };

/** Works out how to play a video link pasted in admin: YouTube, Vimeo, TikTok, an uploaded file, or a plain link. */
export function parseVideo(url: string | undefined | null): VideoSource {
  const value = (url || "").trim();
  if (!value) return { kind: "none" };
  if (value.startsWith("/") || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(value) || /supabase\.co\/storage/.test(value)) return { kind: "file", src: value };
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { kind: "none" };
  }
  const host = parsed.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be" || host.endsWith("youtube.com")) {
    const id = host === "youtu.be" ? parsed.pathname.slice(1) : parsed.searchParams.get("v") || parsed.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{6,})/)?.[1] || "";
    if (/^[\w-]{6,}$/.test(id)) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`, vertical: parsed.pathname.includes("/shorts/"), provider: "YouTube" };
  }
  if (host.endsWith("vimeo.com")) {
    const id = parsed.pathname.match(/(\d{6,})/)?.[1];
    if (id) return { kind: "iframe", src: `https://player.vimeo.com/video/${id}`, vertical: false, provider: "Vimeo" };
  }
  if (host.endsWith("tiktok.com")) {
    const id = parsed.pathname.match(/video\/(\d+)/)?.[1];
    if (id) return { kind: "iframe", src: `https://www.tiktok.com/embed/v2/${id}`, vertical: true, provider: "TikTok" };
    return { kind: "link", src: value, provider: "TikTok" };
  }
  if (host.endsWith("facebook.com") || host === "fb.watch") return { kind: "link", src: value, provider: "Facebook" };
  if (host.endsWith("instagram.com")) return { kind: "link", src: value, provider: "Instagram" };
  return { kind: "link", src: value, provider: "video" };
}
