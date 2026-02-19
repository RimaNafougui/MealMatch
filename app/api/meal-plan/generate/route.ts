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
          title, calories, prep_time, dietary_tags, price_per_serving, ingredients
        )
      `,
      )
      .eq("user_id", userId)
      .limit(15);

    const favoriteSummaries = (favorites || [])
      .map((f: any) => f.recipes_catalog)
      .filter(Boolean)
      .map((r: any) => ({
        title: r.title,
        calories: r.calories,
        prep_time: r.prep_time,
        tags: r.dietary_tags,
        cost: r.price_per_serving,
      }));

    const days = config.days_count === 7 ? WEEKDAYS_7 : WEEKDAYS_5;
    const mealLabels = getMealLabels(config.meals_per_day);
    const budgetRange =
      profile?.budget_min && profile?.budget_max
        ? `$${profile.budget_min}–$${profile.budget_max} CAD per week`
        : "budget-friendly (under $80 CAD/week)";
    const restrictions = profile?.dietary_restrictions?.length
      ? profile.dietary_restrictions.join(", ")
      : "none";
    const allergies = profile?.allergies?.length
      ? profile.allergies.join(", ")
      : "none";

    // --- Build OpenAI prompt ---
    const systemPrompt = `You are a meal planning assistant for university students in Canada. 
You create practical, affordable, and nutritious meal plans.
ALWAYS respond with valid JSON only. No markdown, no explanation, no code blocks.
The JSON must be parseable by JSON.parse() directly.`;

    const userPrompt = `Generate a ${config.days_count}-day meal plan (${days.join(", ")}) with ${config.meals_per_day} meal(s) per day (${mealLabels.join(", ")}).

User profile:
- Dietary restrictions: ${restrictions}
- Allergies: ${allergies}  
- Weekly budget: ${budgetRange}
- Favorite recipes to incorporate (include at least 2-3 if possible): ${
      favoriteSummaries.length > 0
        ? JSON.stringify(favoriteSummaries)
        : "none saved yet"
    }

Rules:
1. Respect ALL dietary restrictions and allergies strictly
2. Stay within the weekly budget
3. Vary cuisines and ingredients across the week — avoid repeating the same meal
4. Prefer student-friendly recipes: simple ingredients, under 45 min prep time
5. Incorporate favorite recipes where they fit naturally
6. Meals can be repeated across different days if the user might want that (mark repeatable ones)

Return EXACTLY this JSON shape:
{
  "days": [
    {
      "day": "monday",
      "meals": [
        {
          "slot": "${mealLabels[0]}",
          "title": "Recipe Name",
          "description": "One sentence description",
          "prep_time_minutes": 20,
          "calories": 450,
          "estimated_cost_usd": 3.50,
          "dietary_tags": ["vegetarian"],
          "ingredients_summary": "pasta, tomato sauce, parmesan",
          "is_favorite": false,
          "can_repeat": true,
          "spoonacular_search_query": "pasta tomato"
        }
      ]
    }
  ],
  "total_estimated_cost": 45.00,
  "total_calories_per_day_avg": 1800
}`;

    // --- Call OpenAI ---
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
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

    // --- Enrich plan: match favorite meals back to catalog IDs ---
    if (favoriteSummaries.length > 0) {
      // Build a lookup: title (lowercase) → { catalog_id, spoonacular_id }
      const { data: catalogMatches } = await supabase
        .from("recipes_catalog")
        .select("id, spoonacular_id, title")
        .in(
          "title",
          favoriteSummaries.map((f: any) => f.title),
        );

      const titleToIds = new Map(
        (catalogMatches || []).map((r: any) => [
          r.title.toLowerCase(),
          { recipe_catalog_id: r.id, spoonacular_id: r.spoonacular_id },
        ]),
      );

      mealPlan.days = mealPlan.days.map((day: any) => ({
        ...day,
        meals: day.meals.map((meal: any) => {
          const match = titleToIds.get(meal.title?.toLowerCase());
          return match ? { ...meal, ...match } : meal;
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
