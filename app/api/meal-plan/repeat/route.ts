import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { startOfWeek, endOfWeek, addWeeks, format } from "date-fns";

// POST - repeat a past plan into next week (or a specified target week)
// Body: { plan_id: string, target_week_offset?: number }
// target_week_offset defaults to 1 (= next week). Pass 0 for current week.
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const supabase = getSupabaseServer();
    const body = await req.json();
    const { plan_id, target_week_offset = 1 } = body;

    if (!plan_id) {
      return NextResponse.json(
        { error: "plan_id is required" },
        { status: 400 }
      );
    }

    // --- Load the source plan (must belong to user) ---
    const { data: sourcePlan, error: fetchError } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("id", plan_id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !sourcePlan) {
      return NextResponse.json(
        { error: "Source plan not found" },
        { status: 404 }
      );
    }

    // --- Compute target week dates ---
    const now = new Date();
    const targetWeekStart = startOfWeek(addWeeks(now, target_week_offset), {
      weekStartsOn: 1,
    });
    const targetWeekEnd = endOfWeek(targetWeekStart, { weekStartsOn: 1 });

    const weekStartStr = format(targetWeekStart, "yyyy-MM-dd");
    const weekEndStr = format(targetWeekEnd, "yyyy-MM-dd");

    // --- Check if a plan already exists for that target week ---
    const { data: existingPlan } = await supabase
      .from("meal_plans")
      .select("id, status")
      .eq("user_id", userId)
      .eq("week_start_date", weekStartStr)
      .eq("status", "active")
      .maybeSingle();

    if (existingPlan) {
      return NextResponse.json(
        {
          error: "A plan already exists for that week",
          existing_plan_id: existingPlan.id,
        },
        { status: 409 }
      );
    }

    // --- Deactivate any current active plans (make the repeated one the new active) ---
    await supabase
      .from("meal_plans")
      .update({ is_active: false, status: "draft" })
      .eq("user_id", userId)
      .eq("is_active", true);

    // --- Insert cloned plan ---
    const { data: newPlan, error: insertError } = await supabase
      .from("meal_plans")
      .insert({
        user_id: userId,
        week_start_date: weekStartStr,
        week_end_date: weekEndStr,
        meals: sourcePlan.meals,
        total_calories: sourcePlan.total_calories,
        total_cost: sourcePlan.total_cost,
        days_count: sourcePlan.days_count,
        meals_per_day: sourcePlan.meals_per_day,
        meal_labels: sourcePlan.meal_labels,
        status: "active",
        is_active: true,
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !newPlan) {
      console.error("Repeat plan insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create repeated plan" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (err) {
    console.error("POST /api/meal-plan/repeat error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
