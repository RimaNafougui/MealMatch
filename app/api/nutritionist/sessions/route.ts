import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { getLimits } from "@/utils/plan-limits";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", session.user.id)
      .single();

    if (!getLimits(profile?.plan ?? "free").nutritionist) {
      return NextResponse.json({ error: "premium_required" }, { status: 403 });
    }

    const { data: sessions, error } = await supabase
      .from("nutritionist_sessions")
      .select("id, title, created_at, updated_at")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ sessions: sessions ?? [] });
  } catch (err) {
    console.error("Sessions GET error:", err);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", session.user.id)
      .single();

    if (!getLimits(profile?.plan ?? "free").nutritionist) {
      return NextResponse.json({ error: "premium_required" }, { status: 403 });
    }

    const { data: newSession, error } = await supabase
      .from("nutritionist_sessions")
      .insert({ user_id: session.user.id, title: "Nouvelle conversation" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (err) {
    console.error("Sessions POST error:", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
