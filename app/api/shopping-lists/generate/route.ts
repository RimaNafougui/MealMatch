import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { z } from "zod";
import {
  aggregateIngredients,
  parseIngredientsSummary,
  type RawIngredient,
} from "@/lib/shopping-list-utils";
import type { GeneratedMealPlan, GeneratedMeal } from "@/types/meal-plan";
import { getLimits } from "@/utils/plan-limits";

const schema = z.object({ mealPlanId: z.string().uuid("ID de plan invalide") });

// POST – generate an organized shopping list from a saved meal plan
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides" }, { status: 400 });
    }
    const { mealPlanId } = parsed.data;

    const supabase = getSupabaseServer();

    // Fetch user plan
    const { data: profileData } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", session.user.id)
      .single();
    const userPlan = profileData?.plan ?? "free";

    // Fetch meal plan (verify ownership)
    const { data: mealPlan, error: planError } = await supabase
      .from("meal_plans")
      .select("id, meals")
      .eq("id", mealPlanId)
      .eq("user_id", session.user.id)
      .single();

    if (planError || !mealPlan) {
      return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
    }

    const generatedPlan = mealPlan.meals as GeneratedMealPlan;
    if (!generatedPlan?.days || !Array.isArray(generatedPlan.days)) {
      return NextResponse.json({ error: "Invalid meal plan structure" }, { status: 400 });
    }

    // Collect all meals across all days
    const allMeals: GeneratedMeal[] = generatedPlan.days.flatMap((day) => day.meals ?? []);

    // Collect unique catalog and user recipe IDs
    const catalogIds = Array.from(
      new Set(
        allMeals
          .filter((m) => m.source === "catalog" && m.recipe_catalog_id)
          .map((m) => m.recipe_catalog_id!)
      )
    );
    const userRecipeIds = Array.from(
      new Set(
        allMeals
          .filter((m) => m.source === "user_recipe" && m.user_recipe_id)
          .map((m) => m.user_recipe_id!)
      )
    );

    // Batch-fetch ingredients from recipes_catalog and user_recipes in parallel
    const [catalogResult, userRecipesResult] = await Promise.all([
      catalogIds.length > 0
        ? supabase
            .from("recipes_catalog")
            .select("id, ingredients")
            .in("id", catalogIds)
        : Promise.resolve({ data: [], error: null }),
      userRecipeIds.length > 0
        ? supabase
            .from("user_recipes")
            .select("id, ingredients")
            .in("id", userRecipeIds)
            .eq("user_id", session.user.id)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const catalogMap = new Map<string, Array<{ name: string; amount: number; unit: string }>>(
      ((catalogResult.data as any[]) || []).map((r) => [r.id, r.ingredients || []])
    );
    const userRecipeMap = new Map<string, Array<{ name: string; amount: number; unit: string }>>(
      ((userRecipesResult.data as any[]) || []).map((r) => [r.id, r.ingredients || []])
    );

    // Build the flat list of raw ingredients from all meals
    const rawIngredients: RawIngredient[] = [];

    for (const meal of allMeals) {
      if (meal.source === "catalog" && meal.recipe_catalog_id) {
        const ingredients = catalogMap.get(meal.recipe_catalog_id) ?? [];
        if (ingredients.length > 0) {
          for (const ing of ingredients) {
            rawIngredients.push({
              name: ing.name,
              quantity: ing.amount ?? 1,
              unit: ing.unit ?? "",
            });
          }
        } else if (meal.ingredients_summary) {
          // Fallback: parse ingredients_summary if no structured data
          rawIngredients.push(...parseIngredientsSummary(meal.ingredients_summary));
        }
      } else if (meal.source === "user_recipe" && meal.user_recipe_id) {
        const ingredients = userRecipeMap.get(meal.user_recipe_id) ?? [];
        if (ingredients.length > 0) {
          for (const ing of ingredients) {
            rawIngredients.push({
              name: ing.name,
              quantity: ing.amount ?? 1,
              unit: ing.unit ?? "",
            });
          }
        } else if (meal.ingredients_summary) {
          rawIngredients.push(...parseIngredientsSummary(meal.ingredients_summary));
        }
      } else if (meal.ingredients_summary) {
        // AI-generated or any source with summary only
        rawIngredients.push(...parseIngredientsSummary(meal.ingredients_summary));
      }
    }

    if (rawIngredients.length === 0) {
      return NextResponse.json(
        { error: "No ingredients found in this meal plan" },
        { status: 400 }
      );
    }

    // Free users get a flat list; paid users get the intelligent aisle-organized list
    let organizedItems;
    if (userPlan === "free") {
      // Basic flat list: deduplicate by name only, no aisle grouping
      const seen = new Map<string, { name: string; quantity: number; unit: string; category: string }>();
      for (const ing of rawIngredients) {
        const key = ing.name.toLowerCase().trim();
        if (seen.has(key)) {
          seen.get(key)!.quantity += ing.quantity ?? 1;
        } else {
          seen.set(key, { name: ing.name, quantity: ing.quantity ?? 1, unit: ing.unit ?? "", category: "Divers" });
        }
      }
      organizedItems = Array.from(seen.values());
    } else {
      // Aggregate, classify, and sort ingredients (intelligent aisle-organized list)
      organizedItems = aggregateIngredients(rawIngredients);
    }

    const totalCost = organizedItems.reduce(
      (sum, item) => sum + (("price" in item ? (item.price as number | null) : null) ?? 0) * (item.quantity ?? 1),
      0
    );

    // Upsert: replace existing list for this meal plan, or create new
    const { data: existing } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("meal_plan_id", mealPlanId)
      .eq("user_id", session.user.id)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from("shopping_lists")
        .update({
          items: organizedItems,
          total_cost: totalCost > 0 ? totalCost : null,
          is_completed: false,
          completed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from("shopping_lists")
        .insert({
          user_id: session.user.id,
          meal_plan_id: mealPlanId,
          items: organizedItems,
          total_cost: totalCost > 0 ? totalCost : null,
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ ...result, plan: userPlan });
  } catch (err) {
    console.error("POST /api/shopping-lists/generate error:", err);
    return NextResponse.json({ error: "Failed to generate shopping list" }, { status: 500 });
  }
}
