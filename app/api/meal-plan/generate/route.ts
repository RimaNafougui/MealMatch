import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import OpenAI from "openai";
import { GeneratedMealPlan, MealPlanConfig } from "@/types/meal-plan";
import { startOfWeek, startOfMonth, format, addDays } from "date-fns";
import { mealPlanRateLimit } from "@/utils/rate-limit";
import { cacheDel, cacheDelPattern, CacheKey } from "@/utils/redis";
import { getLimits } from "@/utils/plan-limits";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const WEEKDAYS_5 = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const WEEKDAYS_7 = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function getMealLabels(count: number): string[] {
  if (count === 1) return ["meal"];
  if (count === 2) return ["lunch", "dinner"];
  return ["breakfast", "lunch", "dinner"];
}

function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // ── Rate limiting: max 3 generation attempts per user per minute ─────────
    // (The DB weekly-usage check is the primary guard; this prevents API abuse)
    const rl = await mealPlanRateLimit(userId);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before generating again." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
        },
      );
    }
    const supabase = getSupabaseServer();
    const body = await req.json();
    const config: MealPlanConfig = {
      days_count: body.days_count ?? 5,
      meals_per_day: body.meals_per_day ?? 3,
    };

    // --- Fetch user profile (includes plan) ---
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "plan, dietary_restrictions, allergies, budget_min, budget_max, meal_plan_days, meal_plan_meals_per_day, daily_calorie_target, tdee_kcal, weight_goal, macro_protein_pct, macro_carbs_pct, macro_fat_pct",
      )
      .eq("id", userId)
      .single();

    const userPlan = profile?.plan ?? "free";
    const limits = getLimits(userPlan);

    // --- Check generation limit ---
    const weekStart = getWeekStart(new Date());
    const weekStartStr = format(weekStart, "yyyy-MM-dd");
    const weekEnd = format(
      config.days_count === 7 ? addDays(weekStart, 6) : addDays(weekStart, 4),
      "yyyy-MM-dd",
    );

    // Check if a usage record already exists this week (to avoid duplicate inserts)
    const { data: existingUsage } = await supabase
      .from("meal_plan_usage")
      .select("id")
      .eq("user_id", userId)
      .eq("week_start_date", weekStartStr)
      .maybeSingle();

    if (userPlan === "free") {
      // Monthly limit: max 5 per month for free users
      const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const { count: monthlyCount } = await supabase
        .from("meal_plan_usage")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("generated_at", monthStart + "T00:00:00Z");

      if ((monthlyCount ?? 0) >= limits.mealPlansPerMonth) {
        return NextResponse.json(
          {
            error: "monthly_limit_reached",
            message: `Vous avez atteint la limite de ${limits.mealPlansPerMonth} plans de repas par mois pour le plan gratuit.`,
          },
          { status: 429 },
        );
      }
    }
    // Student and premium users can regenerate freely — no weekly block.

    // --- Fetch user favorites ---
    const { data: favorites } = await supabase
      .from("user_favorites")
      .select(
        `
        recipe_id,
        recipes_catalog (
          id, title, calories, prep_time, dietary_tags, price_per_serving, ingredients, spoonacular_id
        )
      `,
      )
      .eq("user_id", userId)
      .limit(15);

    const favoriteSummaries = (favorites || [])
      .map((f: any) => f.recipes_catalog)
      .filter(Boolean)
      .map((r: any) => ({
        id: r.id,
        title: r.title,
        calories: r.calories,
        prep_time: r.prep_time,
        tags: r.dietary_tags,
        cost: r.price_per_serving,
        spoonacular_id: r.spoonacular_id,
      }));

    const restrictions = profile?.dietary_restrictions?.length
      ? profile.dietary_restrictions.join(", ")
      : "none";
    const allergies = profile?.allergies?.length
      ? profile.allergies.join(", ")
      : "none";

    // --- Allergen tag mapping: exclude recipes likely to contain the allergen ---
    const allergenToExclusionTag: Record<string, string> = {
      gluten: "gluten-free", blé: "gluten-free", wheat: "gluten-free",
      dairy: "dairy-free", lactose: "dairy-free", lait: "dairy-free",
      nuts: "nut-free", "noix": "nut-free", peanuts: "nut-free",
      shellfish: "shellfish-free", fruits_de_mer: "shellfish-free",
      eggs: "egg-free", oeufs: "egg-free", soy: "soy-free", soja: "soy-free",
    };
    const requiredSafeTags = (profile?.allergies || [])
      .map((a: string) => allergenToExclusionTag[a.toLowerCase().trim()])
      .filter(Boolean);

    // --- Fetch a larger pool then filter by allergen safety ---
    const { data: allCatalogRecipes } = await supabase
      .from("recipes_catalog")
      .select("id, title, calories, prep_time, dietary_tags, price_per_serving, ingredients, spoonacular_id, protein, carbs, fat")
      .limit(80);

    // Pre-filter: keep only recipes safe for user's allergies (if we have enough)
    let catalogRecipes = allCatalogRecipes || [];
    if (requiredSafeTags.length > 0) {
      const safeRecipes = catalogRecipes.filter((r: any) => {
        const tags = (r.dietary_tags || []).map((t: string) => t.toLowerCase());
        return requiredSafeTags.every((rt: string) => tags.includes(rt));
      });
      // Only use the filtered pool if it contains enough recipes; otherwise fall back
      if (safeRecipes.length >= 10) catalogRecipes = safeRecipes;
    }

    // --- Fetch user's own recipes ---
    const { data: userRecipes } = await supabase
      .from("user_recipes")
      .select("id, title, calories, prep_time, dietary_tags, price_per_serving, ingredients, protein, carbs, fat")
      .eq("user_id", userId)
      .limit(20);

    // Build recipe pool summaries for the AI
    const catalogPool = (catalogRecipes || []).map((r: any) => ({
      source: "catalog",
      id: r.id,
      spoonacular_id: r.spoonacular_id,
      title: r.title,
      calories: r.calories,
      prep_time: r.prep_time,
      cost: r.price_per_serving,
      tags: r.dietary_tags,
      protein: r.protein,
      carbs: r.carbs,
      fat: r.fat,
    }));

    const userPool = (userRecipes || []).map((r: any) => ({
      source: "user_recipe",
      id: r.id,
      title: r.title,
      calories: r.calories,
      prep_time: r.prep_time,
      cost: r.price_per_serving,
      tags: r.dietary_tags,
      protein: r.protein,
      carbs: r.carbs,
      fat: r.fat,
    }));

    const allAvailableRecipes = [...catalogPool, ...userPool];
    const totalNeeded = config.days_count * config.meals_per_day;

    const days = config.days_count === 7 ? WEEKDAYS_7 : WEEKDAYS_5;
    const mealLabels = getMealLabels(config.meals_per_day);
    const budgetRange =
      profile?.budget_min && profile?.budget_max
        ? `${profile.budget_min}–${profile.budget_max} $ CAD par semaine`
        : "économique (moins de 80 $ CAD/semaine)";

    // Nutritional targets derived from profile
    const dailyCalorieTarget = profile?.daily_calorie_target ?? null;
    const caloriesPerMeal = dailyCalorieTarget
      ? Math.round(dailyCalorieTarget / config.meals_per_day)
      : null;
    const proteinPct = profile?.macro_protein_pct ?? 30;
    const carbsPct   = profile?.macro_carbs_pct   ?? 40;
    const fatPct     = profile?.macro_fat_pct     ?? 30;
    const weightGoal = profile?.weight_goal ?? null;

    const macroTargets = caloriesPerMeal
      ? {
          protein_g: Math.round((caloriesPerMeal * proteinPct) / 100 / 4),
          carbs_g:   Math.round((caloriesPerMeal * carbsPct)   / 100 / 4),
          fat_g:     Math.round((caloriesPerMeal * fatPct)      / 100 / 9),
        }
      : null;

    // --- Build OpenAI prompt ---
    const systemPrompt = `Tu es un assistant de planification de repas pour des étudiants universitaires au Canada.
Tu crées des plans de repas pratiques, abordables et nutritifs.
TOUJOURS répondre en JSON valide uniquement. Pas de markdown, pas d'explication, pas de blocs de code.
Le JSON doit être parseable directement par JSON.parse().
Tout le contenu (titres, descriptions, instructions) doit être en FRANÇAIS.`;

    const allergyBlock = allergies !== "none"
      ? `\n⚠️ ALLERGIES CRITIQUES (NE JAMAIS UTILISER CES INGRÉDIENTS) : ${allergies}\nTout repas contenant ces allergènes est INTERDIT et peut être dangereux pour la santé.`
      : "";

    const nutritionBlock = dailyCalorieTarget
      ? `\n🎯 OBJECTIFS NUTRITIONNELS OBLIGATOIRES :
- Calories totales/jour : ${dailyCalorieTarget} kcal → ${caloriesPerMeal} kcal par repas (±10% acceptable)
- Protéines/repas : ${macroTargets?.protein_g}g (${proteinPct}% des calories)
- Glucides/repas : ${macroTargets?.carbs_g}g (${carbsPct}% des calories)
- Lipides/repas : ${macroTargets?.fat_g}g (${fatPct}% des calories)
- Objectif de poids : ${weightGoal === "lose" ? "PERTE DE POIDS — choisir des recettes hypocaloriques, riches en protéines et fibres, faibles en graisses saturées" : weightGoal === "gain" ? "PRISE DE MASSE — choisir des recettes caloriques, riches en protéines et glucides complexes" : weightGoal === "maintain" ? "MAINTIEN — équilibre calorique" : "non spécifié"}
Ces valeurs nutritionnelles DOIVENT être reflétées dans les champs calories, protein, carbs, fat de chaque repas.`
      : "";

    const userPrompt = `Génère un plan de repas de ${config.days_count} jours (${days.join(", ")}) avec ${config.meals_per_day} repas par jour (${mealLabels.join(", ")}).
${allergyBlock}
${nutritionBlock}

Profil de l'utilisateur :
- Restrictions alimentaires : ${restrictions}
- Budget hebdomadaire : ${budgetRange}
- Recettes favorites à intégrer (inclure au moins 2-3 si possible) : ${
      favoriteSummaries.length > 0
        ? JSON.stringify(favoriteSummaries.map((f: any) => ({ id: f.id, title: f.title, source: "catalog", spoonacular_id: f.spoonacular_id })))
        : "aucune sauvegardée"
    }

Recettes disponibles dans la bibliothèque (catalogue + recettes de l'utilisateur) :
${JSON.stringify(allAvailableRecipes.slice(0, 50), null, 0)}

RÈGLES IMPORTANTES (dans l'ordre de priorité) :
1. ⚠️ SÉCURITÉ ALIMENTAIRE : Respecter ABSOLUMENT toutes les allergies et restrictions. Ne jamais inclure un ingrédient interdit, même en trace.
2. Respecter les restrictions alimentaires : ${restrictions !== "none" ? `les recettes doivent être compatibles avec : ${restrictions}` : "aucune restriction"}
3. 🎯 NUTRITION : Chaque repas DOIT être proche des cibles caloriques et en macronutriments définies. Vérifie les valeurs nutritionnelles et ajuste si besoin.
4. Rester dans le budget hebdomadaire
5. Varier les cuisines et ingrédients — ne jamais répéter le même repas dans le plan
6. Préférer des recettes accessibles : ingrédients simples, moins de 45 min de préparation
7. Intégrer les recettes favorites là où elles s'adaptent naturellement
8. PRIORITÉ : utiliser les recettes du catalogue ou de l'utilisateur autant que possible
9. Si aucune recette disponible ne convient, génère une recette originale (source "ai") avec :
   - Instructions étape par étape complètes en français (minimum 4 étapes)
   - Mesures exactes pour chaque ingrédient
   - Valeurs nutritionnelles précises (calories, protéines, glucides, lipides)
   - URL d'image unsplash pertinente (ex: https://source.unsplash.com/800x600/?salade,poulet)
10. Pour les recettes du catalogue ou de l'utilisateur, inclure leur "id" et "source" exacts

Retourne EXACTEMENT cette structure JSON :
{
  "days": [
    {
      "day": "monday",
      "meals": [
        {
          "slot": "${mealLabels[0]}",
          "source": "catalog",
          "recipe_catalog_id": "uuid-from-catalog-or-null",
          "user_recipe_id": null,
          "title": "Nom de la recette en français",
          "description": "Une phrase de description en français",
          "prep_time_minutes": 20,
          "calories": 450,
          "protein": 25,
          "carbs": 50,
          "fat": 12,
          "estimated_cost_usd": 3.50,
          "dietary_tags": ["vegetarian"],
          "ingredients_summary": "pâtes, sauce tomate, parmesan",
          "instructions": [],
          "is_favorite": false,
          "can_repeat": true,
          "spoonacular_search_query": "pasta tomato",
          "image_url": null
        }
      ]
    }
  ],
  "total_estimated_cost": 45.00,
  "total_calories_per_day_avg": 1800
}

Notes sur les champs :
- Pour source "catalog" : renseigne recipe_catalog_id avec l'id exact, user_recipe_id = null, instructions = []
- Pour source "user_recipe" : renseigne user_recipe_id avec l'id exact, recipe_catalog_id = null, instructions = []
- Pour source "ai" : recipe_catalog_id = null, user_recipe_id = null, instructions = ["Étape 1 : ...", "Étape 2 : ...", ...], image_url = URL unsplash
- spoonacular_id doit être renseigné si la recette vient du catalogue et a un spoonacular_id`;

    // --- Call OpenAI ---
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 6000,
    });

    const rawContent = completion.choices[0]?.message?.content || "";

    let mealPlan: GeneratedMealPlan;
    try {
      mealPlan = JSON.parse(rawContent);
    } catch {
      // Try to extract JSON if there's any wrapping text
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mealPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse OpenAI response as JSON");
      }
    }

    // --- Enrich plan: match catalog IDs and user recipe IDs ---
    // Build lookups for catalog
    const catalogIdMap = new Map(
      (catalogRecipes || []).map((r: any) => [r.id, { spoonacular_id: r.spoonacular_id }])
    );
    const userRecipeIdMap = new Map(
      (userRecipes || []).map((r: any) => [r.id, true])
    );

    mealPlan.days = mealPlan.days.map((day: any) => ({
      ...day,
      meals: day.meals.map((meal: any) => {
        // If AI returned a catalog recipe, ensure spoonacular_id is set
        if (meal.source === "catalog" && meal.recipe_catalog_id) {
          const catalogEntry = catalogIdMap.get(meal.recipe_catalog_id);
          if (catalogEntry) {
            return { ...meal, spoonacular_id: catalogEntry.spoonacular_id };
          }
        }
        return meal;
      }),
    }));

    // Also match favorites by title for backward compatibility
    if (favoriteSummaries.length > 0) {
      const titleToIds = new Map(
        favoriteSummaries.map((f: any) => [
          f.title.toLowerCase(),
          { recipe_catalog_id: f.id, spoonacular_id: f.spoonacular_id },
        ]),
      );

      mealPlan.days = mealPlan.days.map((day: any) => ({
        ...day,
        meals: day.meals.map((meal: any) => {
          if (!meal.recipe_catalog_id) {
            const match = titleToIds.get(meal.title?.toLowerCase());
            if (match) return { ...meal, ...match, source: "catalog" };
          }
          return meal;
        }),
      }));
    }

    // --- Save usage record (only on first generation; regenerations reuse the existing record) ---
    if (!existingUsage) {
      await supabase.from("meal_plan_usage").insert({
        user_id: userId,
        week_start_date: weekStartStr,
        days_count: config.days_count,
        meals_per_day: config.meals_per_day,
      });
    }

    // --- Save draft meal plan ---
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
      console.error("Error saving meal plan:", saveError);
      return NextResponse.json(
        { error: "Failed to save meal plan" },
        { status: 500 },
      );
    }

    // Bust meal plan + stats caches so the UI reflects the new plan immediately
    await Promise.all([
      cacheDel(CacheKey.mealPlanCurrent(userId, weekStartStr)),
      cacheDel(CacheKey.userStats(userId)),
      cacheDelPattern(`user:${userId}:meal-plan:*`),
    ]);

    return NextResponse.json({
      success: true,
      plan: savedPlan,
      meal_plan: mealPlan,
      config: { days, meal_labels: mealLabels },
    });
  } catch (error) {
    console.error("Meal plan generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate meal plan" },
      { status: 500 },
    );
  }
}
