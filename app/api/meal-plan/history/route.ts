import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

// GET - fetch all past active meal plans for the authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();

    const { data: plans, error } = await supabase
      .from("meal_plans")
      .select(
        "id, week_start_date, week_end_date, total_calories, total_cost, days_count, meals_per_day, status, is_active, created_at, meals"
      )
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .order("week_start_date", { ascending: false });

    if (error) {
      console.error("History fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch history" },
        { status: 500 }
      );
    }

    return NextResponse.json({ plans: plans ?? [] });
  } catch (err) {
    console.error("GET /api/meal-plan/history error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
