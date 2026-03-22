import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { getLimits } from "@/utils/plan-limits";

// POST favorite
export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipeId } = await req.json();

    const supabase = getSupabaseServer();

    // Fetch plan and enforce favorites limit for free users
    const { data: profileData } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", session.user.id)
        .single();

    const userPlan = profileData?.plan ?? "free";
    const limits = getLimits(userPlan);

    if (isFinite(limits.maxFavorites)) {
        const { count } = await supabase
            .from("user_favorites")
            .select("id", { count: "exact", head: true })
            .eq("user_id", session.user.id);

        if ((count ?? 0) >= limits.maxFavorites) {
            return NextResponse.json(
                {
                    error: "favorites_limit_reached",
                    message: `Vous avez atteint la limite de ${limits.maxFavorites} favoris pour le plan gratuit.`,
                },
                { status: 403 },
            );
        }
    }

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

