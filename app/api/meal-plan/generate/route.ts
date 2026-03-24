import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import OpenAI from "openai";
import { z } from "zod";
import { GeneratedMealPlan, MealPlanConfig } from "@/types/meal-plan";
import { startOfWeek, startOfMonth, format, addDays, parseISO, differenceInDays } from "date-fns";
import { mealPlanRateLimit } from "@/utils/rate-limit";
import { cacheDel, cacheDelPattern, CacheKey } from "@/utils/redis";
import { getLimits } from "@/utils/plan-limits";
import { NextResponse } from "next/server";

const generateSchema = z.object({
  days_count: z.number().int().min(1).max(28).default(7),
  meals_per_day: z.number().int().min(1).max(6).default(3),
  meal_labels: z.array(z.string()).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  max_prep_time: z.number().nullable().optional(),
  cuisine_types: z.array(z.string()).optional(),
  allow_repetitions: z.boolean().optional(),
  avoid_ingredients: z.array(z.string()).optional(),
  target_calories_per_meal: z.number().positive().nullable().optional(),
  target_protein_per_meal: z.number().positive().nullable().optional(),
  target_carbs_per_meal: z.number().positive().nullable().optional(),
  target_fat_per_meal: z.number().positive().nullable().optional(),
  weekly_budget_cad: z.number().positive().max(500).nullable().optional(),
});

// 120s — streaming responses keep the connection alive well within this
export const maxDuration = 120;

// No client-level timeout; cancellation is handled via req.signal
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0 });

function getMealLabels(count: number): string[] {
  if (count === 1) return ["meal"];
  if (count === 2) return ["lunch", "dinner"];
  return ["breakfast", "lunch", "dinner"];
}

function getDayNamesForRange(start: Date, daysCount: number): string[] {
  return Array.from({ length: daysCount }, (_, i) =>
    format(addDays(start, i), "EEEE").toLowerCase(),
  );
}

export async function POST(req: Request) {
  // ── Auth & rate-limit — return JSON errors synchronously ──────────────────
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const rl = await mealPlanRateLimit(userId);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before generating again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  const rawBody = await req.json();
  const parsed = generateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Configuration invalide", details: parsed.error.flatten() }, { status: 400 });
  }

  const {
    days_count, meals_per_day, start_date, end_date,
    max_prep_time, cuisine_types, allow_repetitions, avoid_ingredients,
    target_calories_per_meal, target_protein_per_meal,
    target_carbs_per_meal, target_fat_per_meal,
    weekly_budget_cad,
  } = parsed.data;

  // ── Resolve date range ────────────────────────────────────────────────────
  let planStart: Date;
  let actualDaysCount: number;
  if (start_date && end_date) {
    planStart = parseISO(start_date);
    actualDaysCount = Math.max(1, Math.min(28, differenceInDays(parseISO(end_date), planStart) + 1));
  } else {
    planStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    actualDaysCount = days_count;
  }
  const weekStartStr = format(planStart, "yyyy-MM-dd");
  const weekEnd = format(addDays(planStart, actualDaysCount - 1), "yyyy-MM-dd");

  const config: MealPlanConfig = {
    days_count: actualDaysCount,
    meals_per_day: meals_per_day as MealPlanConfig["meals_per_day"],
    start_date: weekStartStr,
    end_date: weekEnd,
  };

  const supabase = getSupabaseServer();

  // ── Phase 1: all independent DB reads in parallel ─────────────────────────
  const monthStart = startOfMonth(new Date()).toISOString();
  const [
    { data: profile },
    { data: favorites },
    { data: allCatalogRecipes },
    { data: userRecipes },
  ] = await Promise.all([
    supabase.from("profiles")
      .select("plan, dietary_restrictions, allergies, budget_min, budget_max, daily_calorie_target, weight_goal, macro_protein_pct, macro_carbs_pct, macro_fat_pct")
      .eq("id", userId).single(),
    supabase.from("user_favorites")
      .select("recipe_id, recipes_catalog(id, title, calories, prep_time, dietary_tags, price_per_serving, spoonacular_id)")
      .eq("user_id", userId).limit(15),
    supabase.from("recipes_catalog")
      .select("id, title, calories, prep_time, dietary_tags, price_per_serving, spoonacular_id, protein, carbs, fat")
      .limit(80),
    supabase.from("user_recipes")
      .select("id, title, calories, prep_time, dietary_tags, price_per_serving, protein, carbs, fat")
      .eq("user_id", userId).limit(20),
  ]);

  const userPlan = profile?.plan ?? "free";
  const limits = getLimits(userPlan);

  // ── Phase 2: usage checks ─────────────────────────────────────────────────
  const [{ data: existingUsage }, { count: monthlyCount }] = await Promise.all([
    supabase.from("meal_plan_usage").select("id").eq("user_id", userId).eq("week_start_date", weekStartStr).maybeSingle(),
    userPlan === "free"
      ? supabase.from("meal_plan_usage").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("generated_at", monthStart)
      : Promise.resolve({ count: 0, data: null, error: null }),
  ]);

  if (userPlan === "free" && (monthlyCount ?? 0) >= limits.mealPlansPerMonth) {
    return NextResponse.json(
      { error: "monthly_limit_reached", message: `Limite de ${limits.mealPlansPerMonth} plans/mois atteinte.` },
      { status: 429 },
    );
  }

  // ── Build recipe pool ─────────────────────────────────────────────────────
  const allergenToExclusionTag: Record<string, string> = {
    gluten: "gluten-free", blé: "gluten-free", wheat: "gluten-free",
    dairy: "dairy-free", lactose: "dairy-free", lait: "dairy-free",
    nuts: "nut-free", noix: "nut-free", peanuts: "nut-free",
    shellfish: "shellfish-free", eggs: "egg-free", oeufs: "egg-free",
    soy: "soy-free", soja: "soy-free",
  };
  const requiredSafeTags = (profile?.allergies || [])
    .map((a: string) => allergenToExclusionTag[a.toLowerCase().trim()])
    .filter(Boolean);

  let catalogRecipes = allCatalogRecipes || [];
  if (requiredSafeTags.length > 0) {
    const safe = catalogRecipes.filter((r: any) => {
      const tags = (r.dietary_tags || []).map((t: string) => t.toLowerCase());
      return requiredSafeTags.every((rt: string) => tags.includes(rt));
    });
    if (safe.length >= 10) catalogRecipes = safe;
  }

  const catalogPool = catalogRecipes.map((r: any) => ({
    source: "catalog", id: r.id, title: r.title, calories: r.calories,
    prep_time: r.prep_time, cost: r.price_per_serving,
    protein: r.protein, carbs: r.carbs, fat: r.fat,
  }));
  const userPool = (userRecipes || []).map((r: any) => ({
    source: "user_recipe", id: r.id, title: r.title, calories: r.calories,
    prep_time: r.prep_time, cost: r.price_per_serving,
    protein: r.protein, carbs: r.carbs, fat: r.fat,
  }));
  const recipePool = [...catalogPool, ...userPool].slice(0, 30);

  const favoriteSummaries = (favorites || [])
    .map((f: any) => f.recipes_catalog).filter(Boolean)
    .map((r: any) => ({ id: r.id, title: r.title, spoonacular_id: r.spoonacular_id }));

  // ── Nutritional targets ───────────────────────────────────────────────────
  const dailyCalorieTarget = profile?.daily_calorie_target ?? null;
  const profileCalsPerMeal = dailyCalorieTarget ? Math.round(dailyCalorieTarget / meals_per_day) : null;
  const caloriesPerMeal = target_calories_per_meal ?? profileCalsPerMeal;
  const proteinPct = profile?.macro_protein_pct ?? 30;
  const carbsPct   = profile?.macro_carbs_pct   ?? 40;
  const fatPct     = profile?.macro_fat_pct     ?? 30;

  const macroTargets = (caloriesPerMeal || target_protein_per_meal || target_carbs_per_meal || target_fat_per_meal)
    ? {
        protein_g: target_protein_per_meal ?? (caloriesPerMeal ? Math.round((caloriesPerMeal * proteinPct) / 400) : null),
        carbs_g:   target_carbs_per_meal   ?? (caloriesPerMeal ? Math.round((caloriesPerMeal * carbsPct)   / 400) : null),
        fat_g:     target_fat_per_meal     ?? (caloriesPerMeal ? Math.round((caloriesPerMeal * fatPct)      / 900) : null),
      }
    : null;

  // ── Prompt ────────────────────────────────────────────────────────────────
  const restrictions = profile?.dietary_restrictions?.length ? profile.dietary_restrictions.join(", ") : "none";
  const allergies    = profile?.allergies?.length            ? profile.allergies.join(", ")            : "none";
  const budgetRange = weekly_budget_cad
    ? `${weekly_budget_cad} $ CAD/sem (strict — keep total estimated cost under this)`
    : (profile?.budget_min && profile?.budget_max)
      ? `${profile.budget_min}–${profile.budget_max} $ CAD/sem`
      : "< 80 $ CAD/sem";

  const days      = getDayNamesForRange(planStart, actualDaysCount);
  const mealLabels = getMealLabels(meals_per_day);
  const dynamicMaxTokens = Math.min(5500, actualDaysCount * meals_per_day * 200 + 500);

  const systemPrompt = `Tu es un assistant de planification de repas. Réponds UNIQUEMENT en JSON valide parseable par JSON.parse(). Tout en FRANÇAIS.`;

  const blocks = [
    allergies !== "none" ? `⚠️ ALLERGIES (JAMAIS utiliser) : ${allergies}` : "",
    max_prep_time != null ? `⏱️ Prep max : ${max_prep_time} min` : "",
    avoid_ingredients?.length ? `🚫 Éviter : ${avoid_ingredients.join(", ")}` : "",
    cuisine_types?.length ? `🌍 Cuisines : ${cuisine_types.join(", ")}` : "",
    allow_repetitions ? "♻️ Répétitions autorisées (meal prep)" : "✅ Pas de répétition de repas",
    (caloriesPerMeal || macroTargets) ? `🎯 Objectifs/repas :${caloriesPerMeal ? ` ${caloriesPerMeal} kcal` : ""}${macroTargets?.protein_g != null ? ` | P:${macroTargets.protein_g}g` : ""}${macroTargets?.carbs_g != null ? ` | G:${macroTargets.carbs_g}g` : ""}${macroTargets?.fat_g != null ? ` | L:${macroTargets.fat_g}g` : ""}` : "",
    profile?.weight_goal === "lose" ? "Objectif : perte de poids (hypocalorique, riche en protéines)" :
    profile?.weight_goal === "gain" ? "Objectif : prise de masse (hypercalorique, riche en protéines)" : "",
  ].filter(Boolean).join("\n");

  const userPrompt = `Plan de ${actualDaysCount} jours (${days.join(", ")}), ${meals_per_day} repas/jour (${mealLabels.join(", ")}).
${blocks}
Restrictions : ${restrictions} | Budget : ${budgetRange}
Favoris à inclure (2-3) : ${favoriteSummaries.length ? JSON.stringify(favoriteSummaries) : "aucun"}
Recettes disponibles (utilise "id" et "source" exacts dans ta réponse) :
${JSON.stringify(recipePool)}

Retourne ce JSON (un objet, pas un tableau) :
{"days":[{"day":"monday","meals":[{"slot":"${mealLabels[0]}","source":"catalog","recipe_catalog_id":"uuid-ou-null","user_recipe_id":null,"title":"Titre","description":"1 phrase","prep_time_minutes":20,"calories":450,"protein":25,"carbs":50,"fat":12,"estimated_cost_usd":3.5,"dietary_tags":["vegetarian"],"ingredients_summary":"ingrédient1, ingrédient2","instructions":[],"is_favorite":false,"can_repeat":false,"spoonacular_search_query":"search terms","image_url":null}]}],"total_estimated_cost":45.0,"total_calories_per_day_avg":1800}
Rules: source "catalog"→recipe_catalog_id=uuid exact. source "user_recipe"→user_recipe_id=uuid exact. source "ai"→both ids null, instructions=["Étape 1:...",…], image_url=unsplash URL.`;

  // ── SSE streaming response ────────────────────────────────────────────────
  const encoder = new TextEncoder();
  const openaiAbort = new AbortController();
  req.signal.addEventListener("abort", () => openaiAbort.abort(), { once: true });

  const readableStream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
      };

      try {
        const openaiStream = await openai.chat.completions.create(
          {
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: dynamicMaxTokens,
            response_format: { type: "json_object" },
            stream: true,
          },
          { signal: openaiAbort.signal },
        );

        let rawContent = "";
        let finishReason = "";
        for await (const chunk of openaiStream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) rawContent += delta;
          if (chunk.choices[0]?.finish_reason) finishReason = chunk.choices[0].finish_reason;
        }

        if (openaiAbort.signal.aborted) { controller.close(); return; }

        if (finishReason === "length") {
          console.warn(`[meal-plan/generate] Token limit hit (max_tokens=${dynamicMaxTokens}). Raw length=${rawContent.length}`);
        }

        // ── Parse — with regex fallback for minor wrapping issues ──
        let mealPlan: GeneratedMealPlan;
        try {
          mealPlan = JSON.parse(rawContent);
        } catch {
          // Try to extract the outermost JSON object
          const match = rawContent.match(/\{[\s\S]*\}/);
          if (match) {
            try {
              mealPlan = JSON.parse(match[0]);
            } catch {
              console.error("[meal-plan/generate] JSON parse failed after extraction. finish_reason:", finishReason, "raw preview:", rawContent.slice(0, 300));
              send({ type: "error", error: finishReason === "length" ? "Plan trop long — réduisez le nombre de jours ou de repas." : "Réponse IA invalide. Réessayez." });
              controller.close();
              return;
            }
          } else {
            console.error("[meal-plan/generate] No JSON found. finish_reason:", finishReason, "raw preview:", rawContent.slice(0, 300));
            send({ type: "error", error: finishReason === "length" ? "Plan trop long — réduisez le nombre de jours ou de repas." : "Réponse IA invalide. Réessayez." });
            controller.close();
            return;
          }
        }

        // ── Enrich: add spoonacular_id from catalog map ──
        const catalogIdMap = new Map(catalogRecipes.map((r: any) => [r.id, r.spoonacular_id]));
        const titleToIds = new Map(
          favoriteSummaries.map((f: any) => [f.title.toLowerCase(), { recipe_catalog_id: f.id, spoonacular_id: f.spoonacular_id }])
        );

        mealPlan.days = mealPlan.days.map((day: any) => ({
          ...day,
          meals: day.meals.map((meal: any) => {
            if (meal.source === "catalog" && meal.recipe_catalog_id) {
              const spId = catalogIdMap.get(meal.recipe_catalog_id);
              if (spId != null) return { ...meal, spoonacular_id: spId };
            }
            if (!meal.recipe_catalog_id) {
              const match = titleToIds.get(meal.title?.toLowerCase());
              if (match) return { ...meal, ...match, source: "catalog" };
            }
            return meal;
          }),
        }));

        // ── Save usage + plan in parallel ──
        await Promise.all([
          !existingUsage
            ? supabase.from("meal_plan_usage").insert({ user_id: userId, week_start_date: weekStartStr, days_count: config.days_count, meals_per_day: config.meals_per_day })
            : Promise.resolve(),
          cacheDel(CacheKey.mealPlanCurrent(userId, weekStartStr)),
          cacheDel(CacheKey.userStats(userId)),
          cacheDelPattern(`user:${userId}:meal-plan:*`),
        ]);

        const { data: savedPlan, error: saveError } = await supabase
          .from("meal_plans")
          .upsert(
            {
              user_id: userId,
              week_start_date: weekStartStr,
              week_end_date: weekEnd,
              meals: mealPlan,
              total_calories: mealPlan.total_calories_per_day_avg,
              total_cost: mealPlan.total_estimated_cost,
              days_count: config.days_count,
              meals_per_day: config.meals_per_day,
              meal_labels: mealLabels,
              status: "draft",
              is_active: false,
              generated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,week_start_date" },
          )
          .select()
          .single();

        if (saveError) {
          send({ type: "error", error: "Failed to save meal plan" });
          controller.close();
          return;
        }

        send({ type: "done", success: true, plan: savedPlan, meal_plan: mealPlan, config: { days, meal_labels: mealLabels } });
      } catch (err: any) {
        const isAbort = err?.name === "AbortError" || openaiAbort.signal.aborted;
        if (!isAbort) {
          console.error("Meal plan generation error:", err);
          send({ type: "error", error: "Failed to generate meal plan" });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
