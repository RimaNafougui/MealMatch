import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { GeneratedMealPlan } from "@/types/meal-plan";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const supabase = getSupabaseServer();
    const { plan_id, meals } = await req.json();

    if (!plan_id) {
      return NextResponse.json(
        { error: "plan_id is required" },
        { status: 400 },
      );
    }

    // Verify ownership
    const { data: existingPlan } = await supabase
      .from("meal_plans")
      .select("id, user_id, total_calories")
      .eq("id", plan_id)
      .eq("user_id", userId)
      .single();

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Deactivate any previously active plans for this week
    await supabase
      .from("meal_plans")
      .update({ is_active: false, status: "draft" })
      .eq("user_id", userId)
      .neq("id", plan_id);

    // Calculate totals from the (possibly modified) meals
    const mealPlan: GeneratedMealPlan = meals;
    const totalCost = mealPlan.total_estimated_cost;
    const totalCalories = mealPlan.total_calories_per_day_avg;

    // Save the accepted (possibly edited) plan as active
    const { data: savedPlan, error } = await supabase
      .from("meal_plans")
      .update({
        meals: mealPlan,
        total_cost: totalCost,
        total_calories: totalCalories,
        status: "active",
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", plan_id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error saving plan:", error);
      return NextResponse.json(
        { error: "Failed to save plan" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, plan: savedPlan });
  } catch (error) {
    console.error("Save meal plan error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
