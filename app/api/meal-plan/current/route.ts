import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { format, startOfWeek } from "date-fns";
import { withCache, CacheKey, TTL } from "@/utils/redis";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekStartStr = format(weekStart, "yyyy-MM-dd");

    const plan = await withCache(
      CacheKey.mealPlanCurrent(userId, weekStartStr),
      TTL.MEAL_PLAN,
      async () => {
        const supabase = getSupabaseServer();
        const { data } = await supabase
          .from("meal_plans")
          .select("*")
          .eq("user_id", userId)
          .eq("week_start_date", weekStartStr)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        return data ?? null;
      },
    );

    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ plan: null });
  }
}
