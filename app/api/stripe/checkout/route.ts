import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    const { priceId, userId, origin, plan } = await req.json();

    try {
        // Crée un client Stripe si pas déjà existant
        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id")
            .eq("id", userId)
            .single();

        let customerId = profile?.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({ metadata: { supabase_id: userId } });
            customerId = customer.id;

            // Sauvegarde l'ID Stripe dans Supabase
            await supabase
                .from("profiles")
                .update({ stripe_customer_id: customerId })
                .eq("id", userId);
        }

        // Crée la session de checkout Stripe
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${origin}/billing/success`,
            cancel_url: `${origin}/billing/cancel`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error("Erreur checkout API:", err);
        return NextResponse.json({ error: "Erreur checkout" }, { status: 500 });
    }
}