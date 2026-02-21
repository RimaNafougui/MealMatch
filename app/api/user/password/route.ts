import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

// PATCH - update password via Supabase Auth
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password, confirmPassword } = await req.json();

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Les mots de passe ne correspondent pas" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase.auth.admin.updateUserById(
      session.user.id,
      { password }
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/user/password error:", err);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
