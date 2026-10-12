import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVideo } from "./video";

test("parses YouTube watch, short and youtu.be links", () => {
  assert.deepEqual(parseVideo("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), { kind: "iframe", src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0", vertical: false, provider: "YouTube" });
  assert.equal(parseVideo("https://youtu.be/dQw4w9WgXcQ").kind, "iframe");
  const short = parseVideo("https://youtube.com/shorts/abcdef12345");
  assert.equal(short.kind === "iframe" && short.vertical, true);
});

test("parses TikTok video links as vertical embeds", () => {
  const tiktok = parseVideo("https://www.tiktok.com/@spotlessnt/video/7234567890123456789");
  assert.equal(tiktok.kind, "iframe");
  assert.equal(tiktok.kind === "iframe" && tiktok.src, "https://www.tiktok.com/embed/v2/7234567890123456789");
});

test("treats uploads and mp4 files as files, and empty as none", () => {
  assert.equal(parseVideo("/uploads/123-job.mp4").kind, "file");
  assert.equal(parseVideo("https://abc.supabase.co/storage/v1/object/public/media/clip").kind, "file");
  assert.equal(parseVideo("").kind, "none");
  assert.equal(parseVideo("not a url").kind, "none");
  assert.equal(parseVideo("https://www.instagram.com/reel/abc/").kind, "link");
});
