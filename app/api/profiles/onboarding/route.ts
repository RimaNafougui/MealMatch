import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    const body = await req.json();

    const {
      // Existing fields
      dietary_restrictions,
      allergies,
      budget_min,
      budget_max,
      // New body metrics
      birth_year,
      sex,
      height_cm,
      weight_kg,
      height_unit,
      weight_unit,
      // Activity
      exercise_days_per_week,
      activity_level,
      tdee_kcal,
      // Goals
      weight_goal,
      goal_weight_kg,
      goal_rate,
      daily_calorie_target,
    } = body;

    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from("profiles")
      .update({
        dietary_restrictions,
        allergies,
        budget_min,
        budget_max,
        // Body metrics
        birth_year: birth_year ?? null,
        sex: sex ?? null,
        height_cm: height_cm ?? null,
        weight_kg: weight_kg ?? null,
        height_unit: height_unit ?? "cm",
        weight_unit: weight_unit ?? "kg",
        // Activity
        exercise_days_per_week: exercise_days_per_week ?? null,
        activity_level: activity_level ?? null,
        tdee_kcal: tdee_kcal ?? null,
        // Goals
        weight_goal: weight_goal ?? null,
        goal_weight_kg: goal_weight_kg ?? null,
        goal_rate: goal_rate ?? null,
        daily_calorie_target: daily_calorie_target ?? null,
        // Mark onboarding as done
        onboarding_completed: true,
      })
      .eq("id", session.user.id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
