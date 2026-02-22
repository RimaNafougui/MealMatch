/**
 * Edge-compatible in-memory rate limiter.
 *
 * Uses a sliding-window counter stored in a module-level Map.
 * Works in both Node.js and Edge runtimes (no external dependencies).
 *
 * Usage:
 *   const result = rateLimit(identifier, { limit: 5, windowMs: 60_000 });
 *   if (!result.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Module-level store — persists across requests within the same process.
// In a multi-process / serverless environment, pair this with an edge KV store (e.g. Upstash Redis).
const store = new Map<string, RateLimitEntry>();

// Periodically sweep stale entries so the Map doesn't grow unboundedly.
// Only registers the timer once per process (module scope).
if (typeof globalThis !== "undefined" && !(globalThis as any).__rlCleanupRegistered) {
  (globalThis as any).__rlCleanupRegistered = true;
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (entry.resetAt < now) store.delete(key);
    });
  }, 60_000).unref?.(); // .unref() keeps Node from hanging on this timer
}

export interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Rolling window length in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  /** Whether the request is within the limit */
  success: boolean;
  /** Current hit count (after this request) */
  current: number;
  /** Max allowed hits */
  limit: number;
  /** Milliseconds until the window resets */
  retryAfterMs: number;
}

/**
 * @param identifier  Unique key per rate-limited entity (e.g. IP, userId, email)
 * @param options     limit + windowMs
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions,
): RateLimitResult {
  const { limit, windowMs } = options;
  const now = Date.now();

  let entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    // Start a fresh window
    entry = { count: 1, resetAt: now + windowMs };
    store.set(identifier, entry);
    return { success: true, current: 1, limit, retryAfterMs: windowMs };
  }

  entry.count += 1;

  return {
    success: entry.count <= limit,
    current: entry.count,
    limit,
    retryAfterMs: entry.resetAt - now,
  };
}

// ─── Pre-configured limiters ─────────────────────────────────────────────────

/** 5 login attempts per IP per minute */
export function loginRateLimit(ip: string) {
  return rateLimit(`login:${ip}`, { limit: 5, windowMs: 60_000 });
}

/** 3 signup attempts per IP per 10 minutes */
export function signupRateLimit(ip: string) {
  return rateLimit(`signup:${ip}`, { limit: 3, windowMs: 10 * 60_000 });
}

/** 1 AI meal plan generation per user per request (soft guard — DB enforces weekly) */
export function mealPlanRateLimit(userId: string) {
  return rateLimit(`mealplan:${userId}`, { limit: 3, windowMs: 60_000 });
}
