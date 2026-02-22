import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

// GET — fetch all recipes created by the authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("user_recipes")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ recipes: data ?? [] });
  } catch (err) {
    console.error("GET /api/recipes/user error:", err);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

// POST — create a new user recipe
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
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

    if (!title?.trim()) {
      return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("user_recipes")
      .insert({
        user_id: session.user.id,
        title: title.trim(),
        image_url: image_url || null,
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
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ recipe: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/recipes/user error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
