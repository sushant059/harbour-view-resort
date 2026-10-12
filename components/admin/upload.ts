"use client";

import { uploadMediaAction } from "@/lib/actions";

/** Shrinks big photos in the browser before upload so they load fast on mobile data. */
async function compress(file: File) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
  return blob ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file;
}

export async function uploadFile(file: File, slot: string) {
  const data = new FormData();
  data.set("file", await compress(file));
  data.set("slot", slot);
  return uploadMediaAction(data);
}
