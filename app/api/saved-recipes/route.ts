import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

// GET - fetch all saved recipes for the authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("saved_recipes")
      .select(`
        id,
        notes,
        custom_servings,
        last_cooked_at,
        times_cooked,
        created_at,
        recipes_catalog (*)
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      recipes: data?.map((item: any) => ({
        savedId: item.id,
        notes: item.notes,
        customServings: item.custom_servings,
        lastCookedAt: item.last_cooked_at,
        timesCooked: item.times_cooked,
        savedAt: item.created_at,
        ...item.recipes_catalog,
      })) ?? [],
    });
  } catch (err) {
    console.error("GET /api/saved-recipes error:", err);
    return NextResponse.json({ error: "Failed to fetch saved recipes" }, { status: 500 });
  }
}

// POST - save a recipe
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipeId, notes } = await req.json();
    if (!recipeId) {
      return NextResponse.json({ error: "recipeId is required" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Upsert to avoid duplicates
    const { error } = await supabase.from("saved_recipes").upsert(
      {
        user_id: session.user.id,
        recipe_id: recipeId,
        notes: notes || null,
      },
      { onConflict: "user_id,recipe_id" }
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/saved-recipes error:", err);
    return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 });
  }
}

// DELETE - unsave a recipe
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipeId } = await req.json();
    if (!recipeId) {
      return NextResponse.json({ error: "recipeId is required" }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("saved_recipes")
      .delete()
      .eq("user_id", session.user.id)
      .eq("recipe_id", recipeId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/saved-recipes error:", err);
    return NextResponse.json({ error: "Failed to remove saved recipe" }, { status: 500 });
  }
}
