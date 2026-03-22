import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const supabase = getSupabaseServer();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("stripe_customer_id, plan")
      .eq("id", session.user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: "Aucun abonnement Stripe associé à ce compte." },
        { status: 400 },
      );
    }

    const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/settings?section=subscription`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json({ error: "Erreur lors de la création du portail" }, { status: 500 });
  }
}
