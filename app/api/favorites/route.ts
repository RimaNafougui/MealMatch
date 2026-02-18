import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

// POST favorite
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

// DELETE favorite
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

// GET favorites
export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
        .from("user_favorites")
        .select(`
      recipes_catalog (*)
    `)
        .eq("user_id", session.user.id);

    if (error) {
        console.error("Supabase Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
        data?.map((item: any) => item.recipes_catalog) ?? []
    );
}

