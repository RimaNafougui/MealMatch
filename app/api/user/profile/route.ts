import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

// GET - fetch profile data
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, image, username, subscription_status, created_at")
      .eq("id", session.user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ profile: data });
  } catch (err) {
    console.error("GET /api/user/profile error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PATCH - update display name
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), updated_at: new Date().toISOString() })
      .eq("id", session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/user/profile error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
