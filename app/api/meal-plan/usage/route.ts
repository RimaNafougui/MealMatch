import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { getLimits } from "@/utils/plan-limits";
import { startOfMonth, format } from "date-fns";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", session.user.id)
      .single();

    const userPlan = profile?.plan ?? "free";
    const limits = getLimits(userPlan);

    const isPremium = userPlan !== "free";

    if (isPremium) {
      return NextResponse.json({
        count: 0,
        limit: null,
        remaining: null,
        isPremium: true,
        plan: userPlan,
      });
    }

    const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const { count } = await supabase
      .from("meal_plan_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .gte("generated_at", monthStart + "T00:00:00Z");

    const usageCount = count ?? 0;
    const limit = limits.mealPlansPerMonth as number;

    return NextResponse.json({
      count: usageCount,
      limit,
      remaining: Math.max(0, limit - usageCount),
      isPremium: false,
      plan: userPlan,
    });
  } catch (err) {
    console.error("Usage GET error:", err);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
