import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import OpenAI from "openai";
import { GeneratedMealPlan, MealPlanConfig } from "@/types/meal-plan";
import { startOfWeek, endOfWeek, format, addDays } from "date-fns";

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
    const supabase = getSupabaseServer();
    const body = await req.json();
    const config: MealPlanConfig = {
      days_count: body.days_count ?? 5,
      meals_per_day: body.meals_per_day ?? 3,
    };

    // --- Check weekly generation limit ---
    const weekStart = getWeekStart(new Date());
    const weekStartStr = format(weekStart, "yyyy-MM-dd");
    const weekEnd = format(
      config.days_count === 7 ? addDays(weekStart, 6) : addDays(weekStart, 4),
      "yyyy-MM-dd",
    );

    const { data: existingUsage } = await supabase
      .from("meal_plan_usage")
      .select("id, generated_at")
      .eq("user_id", userId)
      .eq("week_start_date", weekStartStr)
      .single();

    if (existingUsage) {
      return NextResponse.json(
        {
          error: "already_generated",
          message: "You have already generated a meal plan this week.",
          generated_at: existingUsage.generated_at,
        },
        { status: 429 },
      );
    }

    // --- Fetch user profile ---
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "dietary_restrictions, allergies, budget_min, budget_max, meal_plan_days, meal_plan_meals_per_day",
      )
      .eq("id", userId)
      .single();

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

    // --- Fetch a sample of recipes from catalog (up to 40) matching user restrictions ---
    const catalogQuery = supabase
      .from("recipes_catalog")
      .select("id, title, calories, prep_time, dietary_tags, price_per_serving, ingredients, spoonacular_id, protein, carbs, fat")
      .limit(40);

    // Apply dietary restriction filters if present
    const restrictions = profile?.dietary_restrictions?.length
      ? profile.dietary_restrictions.join(", ")
      : "none";
    const allergies = profile?.allergies?.length
      ? profile.allergies.join(", ")
      : "none";

    const { data: catalogRecipes } = await catalogQuery;

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

    // --- Build OpenAI prompt ---
    const systemPrompt = `Tu es un assistant de planification de repas pour des étudiants universitaires au Canada.
Tu crées des plans de repas pratiques, abordables et nutritifs.
TOUJOURS répondre en JSON valide uniquement. Pas de markdown, pas d'explication, pas de blocs de code.
Le JSON doit être parseable directement par JSON.parse().
Tout le contenu (titres, descriptions, instructions) doit être en FRANÇAIS.`;

    const userPrompt = `Génère un plan de repas de ${config.days_count} jours (${days.join(", ")}) avec ${config.meals_per_day} repas par jour (${mealLabels.join(", ")}).

Profil de l'utilisateur :
- Restrictions alimentaires : ${restrictions}
- Allergies : ${allergies}
- Budget hebdomadaire : ${budgetRange}
- Recettes favorites à intégrer (inclure au moins 2-3 si possible) : ${
      favoriteSummaries.length > 0
        ? JSON.stringify(favoriteSummaries.map((f: any) => ({ id: f.id, title: f.title, source: "catalog", spoonacular_id: f.spoonacular_id })))
        : "aucune sauvegardée"
    }

Recettes disponibles dans la bibliothèque (catalogue + recettes de l'utilisateur) :
${JSON.stringify(allAvailableRecipes.slice(0, 50), null, 0)}

RÈGLES IMPORTANTES :
1. Respecter STRICTEMENT toutes les restrictions alimentaires et allergies
2. Rester dans le budget hebdomadaire
3. Varier les cuisines et ingrédients au cours de la semaine — éviter de répéter le même repas
4. Préférer des recettes accessibles : ingrédients simples, moins de 45 min de préparation
5. Intégrer les recettes favorites là où elles s'adaptent naturellement
6. PRIORITÉ : utiliser les recettes du catalogue ou de l'utilisateur (champs "source": "catalog" ou "user_recipe") autant que possible
7. Si aucune recette disponible ne convient pour un créneau donné, génère une recette originale — dans ce cas :
   - Fournis des instructions complètes étape par étape (minimum 4 étapes) en français
   - Précise les mesures exactes pour chaque ingrédient
   - Fournis les valeurs nutritionnelles complètes (calories, protéines, glucides, lipides)
   - Indique source: "ai"
   - Génère une URL d'image descriptive pour la recette (utilise unsplash.com avec une requête pertinente, ex: https://source.unsplash.com/800x600/?pasta,tomato)
8. Pour les recettes du catalogue ou de l'utilisateur, inclure leur "id" et "source" exacts

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

    // --- Save usage record ---
    await supabase.from("meal_plan_usage").insert({
      user_id: userId,
      week_start_date: weekStartStr,
      days_count: config.days_count,
      meals_per_day: config.meals_per_day,
    });

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
