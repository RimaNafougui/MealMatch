/**
 * Sliding-window rate limiter.
 *
 * When Upstash Redis is configured (UPSTASH_REDIS_REST_URL + TOKEN), rate limit
 * state is stored in Redis — works correctly across multiple serverless instances.
 *
 * Without Redis, falls back to an in-process Map — fine for local dev and
 * single-instance deployments, but counters are NOT shared across workers.
 */

import { Redis } from "@upstash/redis";

// ─── Redis singleton (optional) ───────────────────────────────────────────────

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

// ─── In-process fallback store ────────────────────────────────────────────────

interface RateLimitEntry { count: number; resetAt: number; }
const localStore = new Map<string, RateLimitEntry>();

// Sweep stale entries every 60 s (only for in-process fallback)
if (typeof globalThis !== "undefined" && !(globalThis as any).__rlCleanupRegistered) {
  (globalThis as any).__rlCleanupRegistered = true;
  setInterval(() => {
    const now = Date.now();
    localStore.forEach((entry, key) => {
      if (entry.resetAt < now) localStore.delete(key);
    });
  }, 60_000).unref?.();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Rolling window length in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  current: number;
  limit: number;
  retryAfterMs: number;
}

// ─── Core function ────────────────────────────────────────────────────────────

export async function rateLimit(
  identifier: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const { limit, windowMs } = options;
  const windowSec = Math.ceil(windowMs / 1000);
  const key = `rl:${identifier}`;

  const redis = getRedis();

  // ── Redis path (distributed, accurate across workers) ────────────────────
  if (redis) {
    try {
      // Atomic increment; set expiry only on first call
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSec);
      }
      const ttl = await redis.ttl(key);
      const retryAfterMs = ttl > 0 ? ttl * 1000 : windowMs;

      return {
        success: count <= limit,
        current: count,
        limit,
        retryAfterMs,
      };
    } catch {
      // Redis failure — fall through to in-process fallback
    }
  }

  // ── In-process fallback ───────────────────────────────────────────────────
  const now = Date.now();
  let entry = localStore.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt: now + windowMs };
    localStore.set(key, entry);
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

// ─── Pre-configured limiters ──────────────────────────────────────────────────

/** 5 login attempts per IP per minute */
export function loginRateLimit(ip: string): Promise<RateLimitResult> {
  return rateLimit(`login:${ip}`, { limit: 5, windowMs: 60_000 });
}

/** 3 signup attempts per IP per 10 minutes */
export function signupRateLimit(ip: string): Promise<RateLimitResult> {
  return rateLimit(`signup:${ip}`, { limit: 3, windowMs: 10 * 60_000 });
}

/** 3 AI generation requests per user per minute */
export function mealPlanRateLimit(userId: string): Promise<RateLimitResult> {
  return rateLimit(`mealplan:${userId}`, { limit: 3, windowMs: 60_000 });
}
