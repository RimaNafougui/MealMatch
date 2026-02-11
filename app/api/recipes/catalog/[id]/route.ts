import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase-server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = getSupabaseServer();
    const { id } = await context.params;

    const { data: recipe, error } = await supabase
      .from("recipes_catalog")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching recipe:", error);
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Recipe fetch error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
