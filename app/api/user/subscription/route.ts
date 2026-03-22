import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "plan, subscription_status, current_period_end, stripe_subscription_id, stripe_customer_id, stripe_price_id",
      )
      .eq("id", session.user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      plan: data?.plan ?? "free",
      subscription_status: data?.subscription_status ?? null,
      current_period_end: data?.current_period_end ?? null,
      has_stripe_customer: !!data?.stripe_customer_id,
      has_subscription: !!data?.stripe_subscription_id,
    });
  } catch (err) {
    console.error("GET /api/user/subscription error:", err);
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
  }
}
