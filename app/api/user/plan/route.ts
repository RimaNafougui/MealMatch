// app/api/user/plan/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

export async function GET() {
    const session = await auth();

    // Pas connecté → plan free par défaut
    if (!session?.user?.id) {
        return NextResponse.json({ plan: "free" });
    }

    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", session.user.id)
        .single();

    if (error) {
        console.error("Error fetching plan:", error);
        return NextResponse.json({ plan: "free" });
    }

    return NextResponse.json({
        plan: data?.plan ?? "free",
    });
}