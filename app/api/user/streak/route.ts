import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { getISOWeek, getISOWeekYear } from "date-fns";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("meal_plan_usage")
      .select("generated_at")
      .eq("user_id", session.user.id)
      .order("generated_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ streak: 0, lastPlanned: null });
    }

    // Group by ISO year-week
    const weekSet = new Set<string>();
    for (const row of data) {
      const d = new Date(row.generated_at);
      const week = `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(2, "0")}`;
      weekSet.add(week);
    }

    // Walk backwards from current week counting consecutive weeks
    const now = new Date();
    let streak = 0;
    let checkDate = new Date(now);

    while (true) {
      const key = `${getISOWeekYear(checkDate)}-W${String(getISOWeek(checkDate)).padStart(2, "0")}`;
      if (weekSet.has(key)) {
        streak++;
        // Go back 7 days
        checkDate = new Date(checkDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    const lastPlanned = data[0]?.generated_at ?? null;

    return NextResponse.json({ streak, lastPlanned });
  } catch (err) {
    console.error("Streak GET error:", err);
    return NextResponse.json({ error: "Failed to fetch streak" }, { status: 500 });
  }
}
