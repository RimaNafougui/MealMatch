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

    const systemPrompt = `You are a meal planning assistant. Respond with valid JSON only. No markdown, no explanation.`;

    const userPrompt = `Suggest ONE alternative meal for ${day} ${slot}.

Current meal being replaced: "${current_meal?.title || "none"}"
Already used in this plan (avoid these): ${usedTitles.slice(0, 10).join(", ") || "none"}
Dietary restrictions: ${restrictions}
Allergies: ${allergies}
Budget target: around $${((profile?.budget_min || 0 + (profile?.budget_max || 80)) / 2 / 21).toFixed(2)} per meal

Return exactly this JSON (one meal object, not an array):
{
  "slot": "${slot}",
  "title": "Recipe Name",
  "description": "One sentence description",
  "prep_time_minutes": 20,
  "calories": 450,
  "estimated_cost_usd": 3.50,
  "dietary_tags": ["vegetarian"],
  "ingredients_summary": "ingredient 1, ingredient 2, ingredient 3",
  "is_favorite": false,
  "can_repeat": true,
  "spoonacular_search_query": "search query"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 500,
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

    return NextResponse.json({ success: true, meal });
  } catch (error) {
    console.error("Regenerate slot error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate meal" },
      { status: 500 },
    );
  }
}
