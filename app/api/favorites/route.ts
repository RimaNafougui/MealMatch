import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/utils/supabase";

// POST favorite
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipeId } = await req.json();
    if (!recipeId) {
        return NextResponse.json({ error: "Missing recipeId" }, { status: 400 });
    }

    const { error } = await supabase
        .from("user_favorites")
        .insert({ recipe_id: recipeId, user_id: session.user.id });

    if (error) {
        console.error("Supabase insert error:", error);
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

    let recipeId: string | undefined;

    try {
        // 1️⃣ essaie de parser le body
        const body = await req.json().catch(() => null);
        recipeId = body?.recipeId;

        // 2️⃣ si body vide, on peut lire depuis query params
        if (!recipeId) {
            const url = new URL(req.url);
            recipeId = url.searchParams.get("recipeId") || undefined;
        }

        if (!recipeId) {
            return NextResponse.json({ error: "Missing recipeId" }, { status: 400 });
        }
    } catch (err) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("recipe_id", recipeId)
        .eq("user_id", session.user.id);

    if (error) {
        console.error("Supabase delete error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
