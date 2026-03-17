// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServer } from "@/utils/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS: Record<string, string> = {
    student: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDENT!,
    premium: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM!,
};

export async function POST(req: NextRequest) {
    try {
        const { plan, userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        if (!plan || !PRICE_IDS[plan]) {
            return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
        }

        const supabase = getSupabaseServer();

        // Récupère l'id Stripe du profil
        const { data: profile, error: profileErr } = await supabase
            .from("profiles")
            .select("stripe_customer_id")
            .eq("id", userId)
            .single();

        if (profileErr) {
            console.error("Erreur récupération profil:", profileErr);
            return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
        }

        let customerId = profile?.stripe_customer_id;

        // Si pas de client Stripe, en créer un
        if (!customerId) {
            const customer = await stripe.customers.create({
                metadata: { supabase_id: userId },
            });
            customerId = customer.id;

            await supabase
                .from("profiles")
                .update({ stripe_customer_id: customerId })
                .eq("id", userId);
        }

        // Crée la session de checkout
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            customer: customerId,
            line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
            success_url: `${req.headers.get("origin")}/billing/success`,
            cancel_url: `${req.headers.get("origin")}/billing/cancel`,
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (err) {
        console.error("Erreur checkout API:", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}