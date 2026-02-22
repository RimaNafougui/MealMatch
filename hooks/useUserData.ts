"use client";

/**
 * Shared React Query hooks for user data.
 *
 * All hooks share the same query keys, so data is automatically deduped
 * and reused across any component that calls them on the same page.
 * Mutations automatically invalidate related queries so the UI stays in sync.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  stats: ["user", "stats"] as const,
  nutrition: ["user", "nutrition"] as const,
  weightLogs: (days = 90) => ["user", "weight-logs", days] as const,
  profile: ["user", "profile"] as const,
  preferences: ["user", "preferences"] as const,
  notifications: ["user", "notifications"] as const,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NutritionProfile {
  birth_year?: number | null;
  sex?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  height_unit?: "cm" | "in";
  weight_unit?: "kg" | "lbs";
  exercise_days_per_week?: number | null;
  activity_level?: string | null;
  tdee_kcal?: number | null;
  weight_goal?: "lose" | "maintain" | "gain" | null;
  goal_weight_kg?: number | null;
  goal_rate?: number | null;
  daily_calorie_target?: number | null;
  macro_protein_pct?: number | null;
  macro_carbs_pct?: number | null;
  macro_fat_pct?: number | null;
}

export interface WeightLog {
  id: string;
  logged_at: string; // "YYYY-MM-DD"
  weight_kg: number;
  note?: string | null;
}

export interface UserStats {
  savedRecipes: number;
  mealPlans: number;
  favorites: number;
  profile: {
    name: string;
    email?: string;
    image?: string;
    username?: string;
    created_at?: string;
    plan?: "free" | "premium" | "pro" | null;
  } | null;
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchStats(): Promise<UserStats> {
  const res = await fetch("/api/user/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

async function fetchNutrition(): Promise<NutritionProfile> {
  const res = await fetch("/api/user/nutrition");
  if (!res.ok) throw new Error("Failed to fetch nutrition");
  const data = await res.json();
  return data.nutrition ?? {};
}

async function fetchWeightLogs(days: number): Promise<WeightLog[]> {
  const res = await fetch(`/api/user/weight-logs?days=${days}`);
  if (!res.ok) throw new Error("Failed to fetch weight logs");
  const data = await res.json();
  return data.logs ?? [];
}

async function fetchProfile(): Promise<Record<string, unknown>> {
  const res = await fetch("/api/user/profile");
  if (!res.ok) throw new Error("Failed to fetch profile");
  const data = await res.json();
  return data.profile ?? data ?? {};
}

async function fetchPreferences(): Promise<Record<string, unknown>> {
  const res = await fetch("/api/user/preferences");
  if (!res.ok) throw new Error("Failed to fetch preferences");
  const data = await res.json();
  return data.preferences ?? data ?? {};
}

async function fetchNotifications(): Promise<Record<string, unknown>> {
  const res = await fetch("/api/user/notifications");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  const data = await res.json();
  return data.notifications ?? data ?? {};
}

// ─── Query Hooks ──────────────────────────────────────────────────────────────

/** Dashboard stats (saved recipes count, meal plans, favorites, plan tier) */
export function useStats(): UseQueryResult<UserStats> {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: fetchStats,
    staleTime: 5 * 60_000,  // 5 min
  });
}

/** User nutrition / body composition profile */
export function useNutrition(): UseQueryResult<NutritionProfile> {
  return useQuery({
    queryKey: QUERY_KEYS.nutrition,
    queryFn: fetchNutrition,
    staleTime: 5 * 60_000,
  });
}

/** Weight logs — `days` defaults to 90 */
export function useWeightLogs(days = 90): UseQueryResult<WeightLog[]> {
  return useQuery({
    queryKey: QUERY_KEYS.weightLogs(days),
    queryFn: () => fetchWeightLogs(days),
    staleTime: 2 * 60_000,  // 2 min (users log frequently)
  });
}

/** Full user profile (settings page) */
export function useProfile(): UseQueryResult<Record<string, unknown>> {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: fetchProfile,
    staleTime: 5 * 60_000,
  });
}

/** Dietary preferences */
export function usePreferences(): UseQueryResult<Record<string, unknown>> {
  return useQuery({
    queryKey: QUERY_KEYS.preferences,
    queryFn: fetchPreferences,
    staleTime: 10 * 60_000,
  });
}

/** Notification settings */
export function useNotifications(): UseQueryResult<Record<string, unknown>> {
  return useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: fetchNotifications,
    staleTime: 10 * 60_000,
  });
}

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

interface LogWeightInput {
  weight_kg?: number;
  weight_lbs?: number;
  note?: string | null;
  logged_at?: string;
}

/** POST /api/user/weight-logs — automatically invalidates the weight-logs query */
export function useLogWeight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: LogWeightInput) => {
      const res = await fetch("/api/user/weight-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to log weight");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all weight-log queries (any days range)
      qc.invalidateQueries({ queryKey: ["user", "weight-logs"] });
    },
  });
}

/** DELETE /api/user/weight-logs — automatically invalidates the weight-logs query */
export function useDeleteWeightLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/user/weight-logs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to delete log");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "weight-logs"] });
    },
  });
}

/** PATCH /api/user/nutrition */
export function useUpdateNutrition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (update: Partial<NutritionProfile>) => {
      const res = await fetch("/api/user/nutrition", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to update nutrition");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.nutrition });
    },
  });
}

/** PATCH /api/user/profile */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (update: Record<string, unknown>) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.profile });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}
