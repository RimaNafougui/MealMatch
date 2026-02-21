import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

// GET - fetch user preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("profiles")
      .select("dietary_restrictions, allergies, budget_min, budget_max, meal_plan_days, meal_plan_meals_per_day")
      .eq("id", session.user.id)
      .single();

    if (error) throw error;

    // Map DB fields to UI-friendly format
    const dietary = data?.dietary_restrictions?.[0] || "none";
    const budgetMax = data?.budget_max ?? 60;
    const budget =
      budgetMax <= 30 ? "low" : budgetMax <= 60 ? "medium" : "high";

    return NextResponse.json({
      dietary,
      budget,
      allergies: data?.allergies || [],
      budget_min: data?.budget_min ?? 0,
      budget_max: budgetMax,
    });
  } catch (err) {
    console.error("GET /api/user/preferences error:", err);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

// PATCH - update user preferences
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dietary, budget, allergies } = await req.json();

    // Map UI budget key to min/max
    const budgetMap: Record<string, { min: number; max: number }> = {
      low:    { min: 0,  max: 30 },
      medium: { min: 30, max: 60 },
      high:   { min: 60, max: 200 },
    };
    const budgetRange = budgetMap[budget] ?? budgetMap.medium;

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("profiles")
      .update({
        dietary_restrictions: dietary && dietary !== "none" ? [dietary] : [],
        allergies: allergies || [],
        budget_min: budgetRange.min,
        budget_max: budgetRange.max,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/user/preferences error:", err);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
