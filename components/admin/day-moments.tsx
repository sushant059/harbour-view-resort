"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import { uploadFile } from "@/components/admin/upload";
import { MediaImage } from "@/components/media-image";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toaster";
import { saveSettingsAction } from "@/lib/actions";
import type { DayMoment, Settings } from "@/lib/types";

const BLANK: DayMoment = { time: "", title: "", text: "", image: "", href: "/booking" };

/**
 * "A day at Harbour View" on the homepage. Each moment of the day has a time, words and a photo:
 * upload the resort's real photo and it replaces the stock picture straight away.
 */
export function DayMomentsEditor({ settings }: { settings: Settings }) {
  const router = useRouter();
  const toast = useToast();
  const [moments, setMoments] = useState<DayMoment[]>(settings.dayMoments);
  const [uploading, setUploading] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const patch = (index: number, change: Partial<DayMoment>) => setMoments((list) => list.map((item, i) => (i === index ? { ...item, ...change } : item)));
  const move = (index: number, by: -1 | 1) =>
    setMoments((list) => {
      const next = [...list];
      const target = index + by;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  function save(list = moments) {
    start(async () => {
      const result = await saveSettingsAction({ ...settings, dayMoments: list });
      toast(result.ok ? "Saved — the homepage is updated." : result.error, result.ok ? "ok" : "error");
      if (result.ok) router.refresh();
    });
  }

  async function upload(index: number, file: File | undefined) {
    if (!file) return;
    setUploading(index);
    // Save the words first so the upload lands on the right moment, even if they were reordered.
    const saved = await saveSettingsAction({ ...settings, dayMoments: moments });
    if (!saved.ok) {
      setUploading(null);
      toast(saved.error, "error");
      return;
    }
    const result = await uploadFile(file, `day-moment:${index}`);
    setUploading(null);
    if (!result.ok || !result.url) {
      toast(result.ok ? "Upload failed." : result.error, "error");
      return;
    }
    patch(index, { image: result.url });
    toast("Photo added to the homepage.", "ok");
    router.refresh();
  }

  return (
    <form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); save(); }}>
      {moments.map((moment, index) => (
        <article key={index} className="grid gap-5 rounded-card bg-white p-4 shadow-card md:grid-cols-[260px_1fr] md:p-5">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mist">
              {moment.image ? (
                <MediaImage src={moment.image} alt={moment.title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center p-4 text-center text-sm text-slate">
                  <span><ImagePlus className="mx-auto mb-2 h-7 w-7 text-brand" aria-hidden />A stock photo shows here until you add yours.</span>
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-navy/85 px-3 py-1 font-display text-sm text-white">{moment.time || "--:--"}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-deep">
                <ImagePlus className="h-4 w-4" aria-hidden /> {uploading === index ? "Uploading…" : moment.image ? "Change photo" : "Upload photo"}
                <input type="file" accept="image/*" className="sr-only" disabled={uploading !== null} onChange={(event) => { upload(index, event.target.files?.[0]); event.target.value = ""; }} />
              </label>
              {moment.image && <Button type="button" size="sm" variant="outline" onClick={() => patch(index, { image: "" })}>Use stock photo</Button>}
            </div>
          </div>
          <div className="grid content-start gap-3 sm:grid-cols-[110px_1fr]">
            <label className="block text-sm font-semibold text-navy">Time
              <Input className="mt-1 font-normal" value={moment.time} placeholder="06:30" onChange={(event) => patch(index, { time: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-navy">Title
              <Input className="mt-1 font-normal" value={moment.title} placeholder="First light on the harbour" onChange={(event) => patch(index, { title: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-navy sm:col-span-2">Words
              <Textarea className="mt-1 min-h-20 font-normal" value={moment.text} onChange={(event) => patch(index, { text: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-navy sm:col-span-2">“Discover” link
              <Input className="mt-1 font-normal" value={moment.href} placeholder="/services/day-spa" onChange={(event) => patch(index, { href: event.target.value })} />
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="button" size="sm" variant="outline" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp className="h-4 w-4" aria-hidden /> Earlier</Button>
              <Button type="button" size="sm" variant="outline" disabled={index === moments.length - 1} onClick={() => move(index, 1)}><ArrowDown className="h-4 w-4" aria-hidden /> Later</Button>
              <Button type="button" size="sm" variant="danger" disabled={moments.length <= 1} onClick={() => setMoments((list) => list.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" aria-hidden /> Remove</Button>
            </div>
          </div>
        </article>
      ))}
      <div className="sticky bottom-0 flex flex-wrap gap-3 rounded-card bg-white p-4 shadow-soft">
        <Button type="submit" disabled={pending || uploading !== null}>{pending ? "Saving…" : "Save moments"}</Button>
        {moments.length < 8 && <Button type="button" variant="outline" onClick={() => setMoments((list) => [...list, { ...BLANK }])}><Plus className="h-4 w-4" aria-hidden /> Add a moment</Button>}
      </div>
    </form>
  );
}
