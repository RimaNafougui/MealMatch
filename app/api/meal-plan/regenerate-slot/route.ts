import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import OpenAI from "openai";
import { GeneratedMeal } from "@/types/meal-plan";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const supabase = getSupabaseServer();
    const { day, slot, current_meal, existing_meals, plan_id } =
      await req.json();

    // Fetch user profile for restrictions + nutrition goals
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, dietary_restrictions, allergies, budget_min, budget_max, daily_calorie_target, macro_protein_pct, macro_carbs_pct, macro_fat_pct, weight_goal, meal_plan_meals_per_day")
      .eq("id", userId)
      .single();

    const userPlan = profile?.plan ?? "free";

    const restrictions = profile?.dietary_restrictions?.length
      ? profile.dietary_restrictions.join(", ")
      : "none";
    const allergies = profile?.allergies?.length
      ? profile.allergies.join(", ")
      : "none";

    // Allergen pre-filter
    const allergenToExclusionTag: Record<string, string> = {
      gluten: "gluten-free", blé: "gluten-free", wheat: "gluten-free",
      dairy: "dairy-free", lactose: "dairy-free", lait: "dairy-free",
      nuts: "nut-free", noix: "nut-free", peanuts: "nut-free",
    };
    const requiredSafeTags = (profile?.allergies || [])
      .map((a: string) => allergenToExclusionTag[a.toLowerCase().trim()])
      .filter(Boolean);

    // Nutrition targets
    const mealsPerDay = profile?.meal_plan_meals_per_day ?? 3;
    const dailyCalorieTarget = profile?.daily_calorie_target ?? null;
    const caloriesPerMeal = dailyCalorieTarget ? Math.round(dailyCalorieTarget / mealsPerDay) : null;
    const proteinPct = profile?.macro_protein_pct ?? 30;
    const carbsPct   = profile?.macro_carbs_pct   ?? 40;
    const fatPct     = profile?.macro_fat_pct     ?? 30;
    const macroTargets = caloriesPerMeal ? {
      protein_g: Math.round((caloriesPerMeal * proteinPct) / 100 / 4),
      carbs_g:   Math.round((caloriesPerMeal * carbsPct)   / 100 / 4),
      fat_g:     Math.round((caloriesPerMeal * fatPct)      / 100 / 9),
    } : null;

    // Build list of already used meal titles to avoid repetition
    const usedTitles = (existing_meals || [])
      .map((m: GeneratedMeal) => m.title)
      .filter((t: string) => t !== current_meal?.title);

    // --- Fetch recipes from catalog and pre-filter by allergen safety ---
    const { data: allCatalog } = await supabase
      .from("recipes_catalog")
      .select("id, title, calories, prep_time, dietary_tags, price_per_serving, protein, carbs, fat, spoonacular_id")
      .limit(60);

    let catalogRecipes = allCatalog || [];
    if (requiredSafeTags.length > 0) {
      const safe = catalogRecipes.filter((r: any) => {
        const tags = (r.dietary_tags || []).map((t: string) => t.toLowerCase());
        return requiredSafeTags.every((rt: string) => tags.includes(rt));
      });
      if (safe.length >= 8) catalogRecipes = safe;
    }

    // --- Fetch user's own recipes ---
    const { data: userRecipes } = await supabase
      .from("user_recipes")
      .select("id, title, calories, prep_time, dietary_tags, price_per_serving, protein, carbs, fat")
      .eq("user_id", userId)
      .limit(15);

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

    const systemPrompt = `Tu es un assistant de planification de repas. Réponds uniquement en JSON valide. Pas de markdown, pas d'explication.
Tout le contenu (titres, descriptions, instructions) doit être en FRANÇAIS.`;

    const allergyLine = allergies !== "none"
      ? `\n⚠️ ALLERGIES CRITIQUES — NE JAMAIS UTILISER : ${allergies}`
      : "";
    const nutritionLine = caloriesPerMeal
      ? `\n🎯 Cibles par repas : ${caloriesPerMeal} kcal · Protéines ${macroTargets?.protein_g}g · Glucides ${macroTargets?.carbs_g}g · Lipides ${macroTargets?.fat_g}g`
      : "";

    const userPrompt = `Suggère UN repas alternatif pour ${day} ${slot}.
${allergyLine}
${nutritionLine}

Repas actuel remplacé : "${current_meal?.title || "aucun"}"
Déjà utilisés dans ce plan (à éviter) : ${usedTitles.slice(0, 10).join(", ") || "aucun"}
Restrictions alimentaires : ${restrictions}
Budget cible : environ ${((profile?.budget_min || 0 + (profile?.budget_max || 80)) / 2 / 21).toFixed(2)} $ par repas

Recettes disponibles (catalogue + recettes de l'utilisateur) :
${JSON.stringify(allAvailableRecipes.slice(0, 30), null, 0)}

RÈGLES :
- ⚠️ Respecter ABSOLUMENT les allergies — aucun ingrédient interdit même en trace
- Respecter les restrictions alimentaires : ${restrictions}
- 🎯 Choisir une recette dont les valeurs nutritionnelles sont proches des cibles définies
- Utilise en priorité une recette du catalogue ou de l'utilisateur (source "catalog" ou "user_recipe")
- Si aucune ne convient, génère une recette originale (source "ai") avec instructions complètes en français et valeurs nutritionnelles précises
- Pour source "ai" : fournis une image_url unsplash pertinente (ex: https://source.unsplash.com/800x600/?salade,legumes)

Retourne exactement cet objet JSON (un seul repas, pas un tableau) :
{
  "slot": "${slot}",
  "source": "catalog",
  "recipe_catalog_id": "uuid-si-catalog-sinon-null",
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
  "ingredients_summary": "ingrédient 1, ingrédient 2, ingrédient 3",
  "instructions": [],
  "is_favorite": false,
  "can_repeat": true,
  "spoonacular_search_query": "search query",
  "image_url": null
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const rawContent = completion.choices[0]?.message?.content || "";

    let meal: GeneratedMeal;
    try {
      meal = JSON.parse(rawContent);
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        meal = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse response");
      }
    }

    // Enrich with spoonacular_id if it's a catalog recipe
    if (meal.source === "catalog" && (meal as any).recipe_catalog_id) {
      const catalogEntry = (catalogRecipes || []).find(
        (r: any) => r.id === (meal as any).recipe_catalog_id
      );
      if (catalogEntry) {
        (meal as any).spoonacular_id = catalogEntry.spoonacular_id;
      }
    }

    return NextResponse.json({ success: true, meal, userPlan });
  } catch (error) {
    console.error("Regenerate slot error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate meal" },
      { status: 500 },
    );
  }
}
