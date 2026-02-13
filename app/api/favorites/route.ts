import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server"; // CHANGED: Import server admin client

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recipeId } = await req.json();

  const supabase = getSupabaseServer();

  const { error } = await supabase.from("user_favorites").insert({
    recipe_id: recipeId,
    user_id: session.user.id,
  });

  if (error) {
    console.error("Supabase Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recipeId } = await req.json();

  const supabase = getSupabaseServer();

  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("recipe_id", recipeId)
    .eq("user_id", session.user.id);

  if (error) {
    console.error("Supabase Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
