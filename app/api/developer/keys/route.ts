import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { getLimits } from "@/utils/plan-limits";
import { createHash, randomBytes } from "crypto";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

async function requirePremium(userId: string) {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();
  const plan = data?.plan ?? "free";
  return getLimits(plan).apiAccess;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await requirePremium(session.user.id))) {
      return NextResponse.json(
        { error: "premium_required", message: "L'accès API nécessite le plan Premium." },
        { status: 403 },
      );
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, label, created_at, last_used_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("API keys GET error:", error);
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await requirePremium(session.user.id))) {
      return NextResponse.json(
        { error: "premium_required", message: "L'accès API nécessite le plan Premium." },
        { status: 403 },
      );
    }

    const { label } = await req.json();

    // Generate a secure random key
    const rawKey = `mm_${randomBytes(32).toString("hex")}`;
    const keyHash = hashKey(rawKey);

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: session.user.id,
        key_hash: keyHash,
        label: label?.trim() || null,
      })
      .select("id, label, created_at")
      .single();

    if (error) throw error;

    // Return plaintext key once — it won't be retrievable again
    return NextResponse.json({ ...data, key: rawKey }, { status: 201 });
  } catch (error) {
    console.error("API keys POST error:", error);
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("api_keys")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API keys DELETE error:", error);
    return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 });
  }
}
