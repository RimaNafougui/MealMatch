// /app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServer } from "@/utils/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook signature failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;

            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;

            // Récupère la ligne item pour déterminer le plan
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            // vérifie qu'il y a au moins un item
            const priceId = lineItems.data?.[0]?.price?.id;
            if (!priceId) {
                console.error("Pas de priceId pour la session:", session.id);
                return NextResponse.json({ error: "Pas de priceId" }, { status: 400 });
            }

            // Map priceId → plan
            let plan: "student" | "premium" = "student";
            if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM) plan = "premium";

            // Trouve l'utilisateur Supabase
            const { data: profile } = await supabase
                .from("profiles")
                .select("id")
                .eq("stripe_customer_id", customerId)
                .single();

            if (profile?.id) {
                await supabase.from("profiles").update({
                    plan,
                    stripe_subscription_id: subscriptionId,
                    stripe_price_id: priceId,
                    subscription_status: "active",
                    current_period_end: new Date(session.expires_at! * 1000).toISOString(),
                }).eq("id", profile.id);
                console.log(`Plan mis à jour pour l'utilisateur ${profile.id}`);
            }
            break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.deleted":
            // Ici tu peux mettre à jour `subscription_status` et `plan` si nécessaire
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}