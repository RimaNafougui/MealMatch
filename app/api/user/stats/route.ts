import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

// GET - fetch user stats for profile page
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const userId = session.user.id;

    // Run all counts in parallel
    const [savedRecipes, mealPlans, favorites, profile] = await Promise.all([
      supabase
        .from("saved_recipes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("meal_plans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("user_favorites")
        .select("recipe_id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("profiles")
        .select("created_at, plan, name, email, image, username")
        .eq("id", userId)
        .single(),
    ]);

    return NextResponse.json({
      savedRecipes: savedRecipes.count ?? 0,
      mealPlans: mealPlans.count ?? 0,
      favorites: favorites.count ?? 0,
      profile: profile.data ?? null,
    });
  } catch (err) {
    console.error("GET /api/user/stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
