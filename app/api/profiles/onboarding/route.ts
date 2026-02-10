import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    const { dietary_restrictions, allergies, budget_min, budget_max } = await req.json();

    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from("profiles")
      .update({
        dietary_restrictions,
        allergies,
        budget_min,
        budget_max,
        onboarding_completed: true,
      })
      .eq("id", session.user.id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
