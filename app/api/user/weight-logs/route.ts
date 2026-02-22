import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

// GET — fetch last 90 days of weight logs
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { searchParams } = new URL(req.url);
    const days = Math.min(Number(searchParams.get("days") ?? 90), 365);

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("weight_logs")
      .select("id, logged_at, weight_kg, note")
      .eq("user_id", session.user.id)
      .gte("logged_at", sinceStr)
      .order("logged_at", { ascending: true });

    if (error) {
      console.error("Weight logs GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data ?? [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — log today's weight (upsert by date)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weight_kg, weight_lbs, note, logged_at } = await req.json();

    // Accept either kg or lbs
    let weightKg: number;
    if (weight_kg != null) {
      weightKg = Number(weight_kg);
    } else if (weight_lbs != null) {
      weightKg = Number(weight_lbs) / 2.20462;
    } else {
      return NextResponse.json({ error: "weight_kg or weight_lbs required" }, { status: 400 });
    }

    if (weightKg < 20 || weightKg > 500) {
      return NextResponse.json({ error: "Weight out of valid range" }, { status: 400 });
    }

    const dateStr = logged_at ?? new Date().toISOString().split("T")[0];

    const supabase = getSupabaseServer();

    // Upsert — one entry per day per user
    const { data, error } = await supabase
      .from("weight_logs")
      .upsert(
        {
          user_id: session.user.id,
          logged_at: dateStr,
          weight_kg: Math.round(weightKg * 10) / 10,
          note: note ?? null,
        },
        { onConflict: "user_id,logged_at" },
      )
      .select()
      .single();

    if (error) {
      console.error("Weight log POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, log: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — remove a log entry by id
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("weight_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id); // ownership guard

    if (error) {
      console.error("Weight log DELETE error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
