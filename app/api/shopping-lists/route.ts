import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

// GET - fetch shopping lists for the user, optionally filtered by mealPlanId
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const mealPlanId = req.nextUrl.searchParams.get("mealPlanId");

    let query = supabase
      .from("shopping_lists")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (mealPlanId) {
      query = query.eq("meal_plan_id", mealPlanId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // If filtering by meal plan, return first match directly
    if (mealPlanId) {
      return NextResponse.json(data?.[0] ?? null);
    }

    return NextResponse.json({ lists: data ?? [] });
  } catch (err) {
    console.error("GET /api/shopping-lists error:", err);
    return NextResponse.json({ error: "Failed to fetch shopping lists" }, { status: 500 });
  }
}

// POST - create a new shopping list (optionally linked to a meal plan)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mealPlanId, items } = await req.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("shopping_lists")
      .insert({
        user_id: session.user.id,
        meal_plan_id: mealPlanId || null,
        items,
        total_cost: items.reduce(
          (sum: number, item: any) => sum + (item.price ?? 0) * (item.quantity ?? 1),
          0
        ),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error("POST /api/shopping-lists error:", err);
    return NextResponse.json({ error: "Failed to create shopping list" }, { status: 500 });
  }
}
