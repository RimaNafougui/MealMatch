import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { getLimits } from "@/utils/plan-limits";

const MAX_FAMILY_MEMBERS = 4;

async function getPlanOrFail(userId: string) {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();
  return data?.plan ?? "free";
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPlan = await getPlanOrFail(session.user.id);
    if (!getLimits(userPlan).familyPlans) {
      return NextResponse.json(
        { error: "premium_required", message: "La gestion des membres de la famille nécessite le plan Premium." },
        { status: 403 },
      );
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("family_members")
      .select("id, name, dietary_restrictions, allergies, created_at")
      .eq("owner_id", session.user.id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Family GET error:", error);
    return NextResponse.json({ error: "Failed to fetch family members" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPlan = await getPlanOrFail(session.user.id);
    if (!getLimits(userPlan).familyPlans) {
      return NextResponse.json(
        { error: "premium_required", message: "La gestion des membres de la famille nécessite le plan Premium." },
        { status: 403 },
      );
    }

    const supabase = getSupabaseServer();

    // Check current count
    const { count } = await supabase
      .from("family_members")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", session.user.id);

    if ((count ?? 0) >= MAX_FAMILY_MEMBERS) {
      return NextResponse.json(
        { error: "family_limit_reached", message: `Vous pouvez ajouter au maximum ${MAX_FAMILY_MEMBERS} membres de la famille.` },
        { status: 403 },
      );
    }

    const { name, dietary_restrictions, allergies } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("family_members")
      .insert({
        owner_id: session.user.id,
        name: name.trim(),
        dietary_restrictions: dietary_restrictions ?? [],
        allergies: allergies ?? [],
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Family POST error:", error);
    return NextResponse.json({ error: "Failed to add family member" }, { status: 500 });
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
      .from("family_members")
      .delete()
      .eq("id", id)
      .eq("owner_id", session.user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Family DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove family member" }, { status: 500 });
  }
}
