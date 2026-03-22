import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { getLimits } from "@/utils/plan-limits";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { days_count, meals_per_day } = await req.json();

    if (days_count && ![5, 7, 14, 21, 28].includes(days_count)) {
      return NextResponse.json(
        { error: "days_count must be 5, 7, 14, 21, or 28" },
        { status: 400 },
      );
    }

    // Gate multi-week planning to premium
    if (days_count && days_count > 7) {
      const supabase = getSupabaseServer();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", session.user.id)
        .single();
      const userPlan = profileData?.plan ?? "free";
      const limits = getLimits(userPlan);
      if (limits.weeksPlanning < Math.ceil(days_count / 7)) {
        return NextResponse.json(
          { error: "premium_required", message: "La planification sur plus d'une semaine nécessite le plan Premium." },
          { status: 403 },
        );
      }
    }
    if (meals_per_day && ![1, 2, 3].includes(meals_per_day)) {
      return NextResponse.json(
        { error: "meals_per_day must be 1, 2, or 3" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServer();
    const updates: Record<string, number> = {};
    if (days_count) updates.meal_plan_days = days_count;
    if (meals_per_day) updates.meal_plan_meals_per_day = meals_per_day;

    const { error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Config save error:", error);
    return NextResponse.json(
      { error: "Failed to save config" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data: profile } = await supabase
      .from("profiles")
      .select("meal_plan_days, meal_plan_meals_per_day")
      .eq("id", session.user.id)
      .single();

    return NextResponse.json({
      days_count: profile?.meal_plan_days || 5,
      meals_per_day: profile?.meal_plan_meals_per_day || 3,
    });
  } catch {
    return NextResponse.json({ days_count: 5, meals_per_day: 3 });
  }
}
