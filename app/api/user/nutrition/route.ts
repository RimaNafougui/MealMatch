import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

const NUTRITION_FIELDS = [
  "birth_year",
  "sex",
  "height_cm",
  "weight_kg",
  "height_unit",
  "weight_unit",
  "exercise_days_per_week",
  "activity_level",
  "tdee_kcal",
  "weight_goal",
  "goal_weight_kg",
  "goal_rate",
  "daily_calorie_target",
  "macro_protein_pct",
  "macro_carbs_pct",
  "macro_fat_pct",
] as const;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("profiles")
      .select(NUTRITION_FIELDS.join(", "))
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Nutrition GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ nutrition: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Only allow whitelisted fields
    const update: Record<string, unknown> = {};
    for (const field of NUTRITION_FIELDS) {
      if (field in body) update[field] = body[field];
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("profiles")
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq("id", session.user.id);

    if (error) {
      console.error("Nutrition PATCH error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
