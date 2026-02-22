/**
 * Upstash Redis client — singleton, works in Node.js and Edge runtimes.
 *
 * Required environment variables:
 *   UPSTASH_REDIS_REST_URL   — from the Upstash console (REST URL)
 *   UPSTASH_REDIS_REST_TOKEN — from the Upstash console (REST token)
 *
 * The client is lazily initialised on first use. If the env vars are missing
 * (e.g. local dev without Redis), every cache call is a no-op and the app
 * falls back to Supabase directly.
 */

import { Redis } from "@upstash/redis";

// ─── Singleton ────────────────────────────────────────────────────────────────

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Redis not configured — cache is disabled, requests go directly to Supabase.
    return null;
  }

  _redis = new Redis({ url, token });
  return _redis;
}

// ─── TTL constants (seconds) ──────────────────────────────────────────────────

export const TTL = {
  /** User profile + plan info — 5 minutes */
  USER_PROFILE:   5  * 60,
  /** User stats (counts) — 5 minutes */
  USER_STATS:     5  * 60,
  /** Nutrition / body data — 5 minutes */
  USER_NUTRITION: 5  * 60,
  /** Preferences — 10 minutes */
  USER_PREFS:     10 * 60,
  /** Current meal plan — 10 minutes */
  MEAL_PLAN:      10 * 60,
  /** Recipe catalog pages — 15 minutes (mostly static) */
  CATALOG:        15 * 60,
  /** Weight logs summary — 2 minutes (users log often) */
  WEIGHT_LOGS:    2  * 60,
} as const;

// ─── Cache key builders ───────────────────────────────────────────────────────

export const CacheKey = {
  userProfile:   (uid: string) => `user:${uid}:profile`,
  userStats:     (uid: string) => `user:${uid}:stats`,
  userNutrition: (uid: string) => `user:${uid}:nutrition`,
  userPrefs:     (uid: string) => `user:${uid}:prefs`,
  mealPlanCurrent: (uid: string, week: string) => `user:${uid}:meal-plan:${week}`,
  catalog:       (params: string) => `catalog:${params}`,
  weightLogs:    (uid: string, days: number) => `user:${uid}:weight-logs:${days}`,
} as const;

// ─── Generic helpers ──────────────────────────────────────────────────────────

/**
 * Get a cached value. Returns null if cache is disabled or key is missing.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return await redis.get<T>(key);
  } catch {
    // Never let a Redis error break the app.
    return null;
  }
}

/**
 * Set a cached value with a TTL (seconds).
 */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    // Non-fatal.
  }
}

/**
 * Delete one or more cache keys (call after a mutation).
 */
export async function cacheDel(...keys: string[]): Promise<void> {
  const redis = getRedis();
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    // Non-fatal.
  }
}

/**
 * Delete all keys matching a pattern (uses SCAN for safety — no KEYS in prod).
 * Use sparingly; prefer targeted cacheDel where possible.
 */
export async function cacheDelPattern(pattern: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    let cursor = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
      cursor = Number(nextCursor);
      if (keys.length > 0) await redis.del(...keys);
    } while (cursor !== 0);
  } catch {
    // Non-fatal.
  }
}

/**
 * Cache-aside helper: try cache first, fall back to `fetchFn`, then populate cache.
 *
 * @example
 * const data = await withCache(CacheKey.userStats(uid), TTL.USER_STATS, () => fetchFromSupabase());
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetchFn();
  // Fire-and-forget — don't await so it doesn't add latency to the response
  cacheSet(key, fresh, ttlSeconds).catch(() => {});
  return fresh;
}
