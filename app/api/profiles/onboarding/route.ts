import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { dietary_restrictions, allergies } = await req.json();

    const supabase = getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        dietary_restrictions,
        allergies,
      })
      .eq("id", user.id); // Assurez-vous que votre champ primaire est "id"

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
