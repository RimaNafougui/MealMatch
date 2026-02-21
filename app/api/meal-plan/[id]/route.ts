import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

// GET - fetch a single meal plan by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data: plan, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", session.user.id)
      .single();

    if (error || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (err) {
    console.error("GET /api/meal-plan/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
  }
}

// DELETE - delete a meal plan
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("id", params.id)
      .eq("user_id", session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/meal-plan/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}
