import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

// DELETE — delete a user recipe (owner only)
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const supabase = getSupabaseServer();

    // Verify ownership before deleting
    const { data: recipe, error: fetchError } = await supabase
      .from("user_recipes")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (recipe.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("user_recipes")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/recipes/user/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
  }
}

// PATCH — update a user recipe (owner only)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const supabase = getSupabaseServer();

    // Verify ownership
    const { data: recipe, error: fetchError } = await supabase
      .from("user_recipes")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (recipe.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      title,
      image_url,
      prep_time,
      servings,
      calories,
      protein,
      carbs,
      fat,
      price_per_serving,
      ingredients,
      instructions,
      dietary_tags,
    } = body;

    const { data: updated, error } = await supabase
      .from("user_recipes")
      .update({
        title: title?.trim(),
        image_url: image_url ?? null,
        prep_time: prep_time ? parseInt(prep_time) : null,
        servings: servings ? parseInt(servings) : 4,
        calories: calories ? parseInt(calories) : null,
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
        price_per_serving: price_per_serving ? parseFloat(price_per_serving) : null,
        ingredients: ingredients ?? [],
        instructions: instructions ?? [],
        dietary_tags: dietary_tags ?? [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ recipe: updated });
  } catch (err) {
    console.error("PATCH /api/recipes/user/[id] error:", err);
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
  }
}
