import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

// DELETE — permanently delete the authenticated user's account and all data
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const supabase = getSupabaseServer();

    // Delete the auth user — Supabase cascades to all tables with FK on auth.users
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error("DELETE /api/user/account error:", error);
      return NextResponse.json({ error: "Impossible de supprimer le compte" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/user/account unexpected error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
