const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true as const };
  }
  if (bucket.count >= limit) {
    return { ok: false as const, retryAfter: Math.ceil((bucket.reset - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true as const };
}
