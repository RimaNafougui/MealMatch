import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase-server";

export async function GET() {
    const supabase = getSupabaseServer();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { onboardingCompleted: false },
            { status: 401 }
        );
    }

    const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

    return NextResponse.json({
        onboardingCompleted: data?.onboarding_completed ?? false,
    });
}
