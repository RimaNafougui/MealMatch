import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServer } from "@/utils/supabase-server";
import { auth } from "@/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {

    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabase = await getSupabaseServer();

    const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_subscription_id")
        .eq("id", session.user.id)
        .single();

    if (!profile?.stripe_subscription_id) {
        return NextResponse.json({ error: "No subscription" });
    }

    await stripe.subscriptions.cancel(profile.stripe_subscription_id);

    return NextResponse.json({ success: true });
}