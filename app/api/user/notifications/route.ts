import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

const DEFAULT_NOTIFICATIONS = {
  mealReminders: true,
  weeklyPlan: true,
  newRecipes: false,
  newsletter: false,
  tips: true,
};

// GET - fetch notification preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("profiles")
      .select("notification_preferences")
      .eq("id", session.user.id)
      .single();

    if (error) throw error;

    const prefs = data?.notification_preferences ?? DEFAULT_NOTIFICATIONS;

    return NextResponse.json({ notifications: { ...DEFAULT_NOTIFICATIONS, ...prefs } });
  } catch (err) {
    console.error("GET /api/user/notifications error:", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// PATCH - update notification preferences
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await req.json();

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("profiles")
      .update({
        notification_preferences: notifications,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/user/notifications error:", err);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
