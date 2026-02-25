// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mapping plan → priceId serveur
const PRICE_IDS: Record<string, string> = {
    student: process.env.STRIPE_PRICE_STUDENT!,
    premium: process.env.STRIPE_PRICE_PREMIUM!,
};

// L’endpoint récupère l’utilisateur côté serveur via Supabase session
export async function POST(req: NextRequest) {
    try {
        const { plan } = await req.json();
        if (!plan || !PRICE_IDS[plan]) {
            return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
        }

        // Récupérer l’utilisateur via le token Supabase (JWT)
        const token = req.headers.get("authorization")?.replace("Bearer ", "");
        if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

        const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 });

        const userId = user.id;

        // Vérifie si le client Stripe existe
        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id")
            .eq("id", userId)
            .single();

        let customerId = profile?.stripe_customer_id;
        if (!customerId) {
            const customer = await stripe.customers.create({ metadata: { supabase_id: userId } });
            customerId = customer.id;
            await supabase
                .from("profiles")
                .update({ stripe_customer_id: customerId })
                .eq("id", userId);
        }

        // Crée la session de checkout
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            customer: customerId,
            line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
            metadata: { plan }, // 🔹 très important pour webhook
            success_url: `${req.headers.get("origin")}/billing/success`,
            cancel_url: `${req.headers.get("origin")}/billing/cancel`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error("Erreur checkout API:", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}