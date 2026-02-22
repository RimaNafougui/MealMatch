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

    // Fetch user profile for restrictions
    const { data: profile } = await supabase
      .from("profiles")
      .select("dietary_restrictions, allergies, budget_min, budget_max")
      .eq("id", userId)
      .single();

    const restrictions = profile?.dietary_restrictions?.length
      ? profile.dietary_restrictions.join(", ")
      : "none";
    const allergies = profile?.allergies?.length
      ? profile.allergies.join(", ")
      : "none";

    // Build list of already used meal titles to avoid repetition
    const usedTitles = (existing_meals || [])
      .map((m: GeneratedMeal) => m.title)
      .filter((t: string) => t !== current_meal?.title);

    // --- Fetch a sample of recipes from catalog ---
    const { data: catalogRecipes } = await supabase
      .from("recipes_catalog")
      .select("id, title, calories, prep_time, dietary_tags, price_per_serving, protein, carbs, fat, spoonacular_id")
      .limit(30);

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

    const userPrompt = `Suggère UN repas alternatif pour ${day} ${slot}.

Repas actuel remplacé : "${current_meal?.title || "aucun"}"
Déjà utilisés dans ce plan (à éviter) : ${usedTitles.slice(0, 10).join(", ") || "aucun"}
Restrictions alimentaires : ${restrictions}
Allergies : ${allergies}
Budget cible : environ ${((profile?.budget_min || 0 + (profile?.budget_max || 80)) / 2 / 21).toFixed(2)} $ par repas

Recettes disponibles (catalogue + recettes de l'utilisateur) :
${JSON.stringify(allAvailableRecipes.slice(0, 30), null, 0)}

RÈGLES :
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

    return NextResponse.json({ success: true, meal });
  } catch (error) {
    console.error("Regenerate slot error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate meal" },
      { status: 500 },
    );
  }
}
