// app/api/stripe/checkout/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const { priceId, userId, origin, planType } = await req.json();

    // récupérer profil
    const { data: profile } = await supabase
        .from("profiles")
        .select("email, stripe_customer_id")
        .eq("id", userId)
        .single();

    let customerId = profile?.stripe_customer_id;

    // créer customer si absent
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: profile?.email,
            metadata: { userId },
        });

        customerId = customer.id;

        await supabase
            .from("profiles")
            .update({ stripe_customer_id: customerId })
            .eq("id", userId);
    }

    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],

        success_url: `${origin}/billing/success`,
        cancel_url: `${origin}/billing/cancel`,

        metadata: {
            userId,
            plan: planType
        }
    });

    return NextResponse.json({ url: session.url });
}