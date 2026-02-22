import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { withCache, cacheDel, CacheKey, TTL } from "@/utils/redis";

// GET - fetch profile data
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const profile = await withCache(
      CacheKey.userProfile(userId),
      TTL.USER_PROFILE,
      async () => {
        const supabase = getSupabaseServer();
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, email, image, username, plan, created_at")
          .eq("id", userId)
          .single();
        if (error) throw error;
        return data;
      },
    );

    return NextResponse.json({ profile });
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

    const userId = session.user.id;
    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) throw error;

    // Bust all profile-related caches
    await cacheDel(
      CacheKey.userProfile(userId),
      CacheKey.userStats(userId),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/user/profile error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
