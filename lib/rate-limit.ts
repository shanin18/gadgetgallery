import { NextResponse } from "next/server";

type RateLimitOptions = {
  name: string;
  limit: number;
  windowMs: number;
};

type Entry = {
  count: number;
  resetAt: number;
};

const storeKey = Symbol.for("gadgetgallery.rate-limit");
const globalStore = globalThis as typeof globalThis & {
  [storeKey]?: Map<string, Entry>;
};

const buckets = globalStore[storeKey] ?? new Map<string, Entry>();
globalStore[storeKey] = buckets;

function getClientId(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export function rateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  const key = `${options.name}:${getClientId(request)}`;
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  entry.count += 1;
  if (entry.count <= options.limit) return null;

  const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
