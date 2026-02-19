import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { format, startOfWeek } from "date-fns";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekStartStr = format(weekStart, "yyyy-MM-dd");

    const { data: plan } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("week_start_date", weekStartStr)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ plan: plan || null });
  } catch {
    return NextResponse.json({ plan: null });
  }
}
