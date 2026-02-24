// app/api/stripe/checkout/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {

    // Récupère l'origine depuis la requête
    const { priceId, userId, origin } = await req.json();


    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}/billing/success`,
        cancel_url: `${origin}/pricing`,
        metadata: { userId, priceId },
    });

    return NextResponse.json({ url: session.url });
}