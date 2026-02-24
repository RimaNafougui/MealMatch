// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fonction pour mettre à jour l'abonnement dans profiles
const handleSubscription = async (subscription: Stripe.Subscription) => {
    if (!subscription.customer) return;

    const item = subscription.items.data[0];
    const recurring = item.price.recurring;
    if (!recurring) throw new Error("Subscription price has no recurring info");

    const interval = recurring.interval;
    const interval_count = recurring.interval_count || 1;
    const start = subscription.billing_cycle_anchor;
    let currentPeriodEnd: number;
    const startDate = new Date(start * 1000);

    switch (interval) {
        case "day":
            currentPeriodEnd = start + interval_count * 24 * 60 * 60;
            break;
        case "week":
            currentPeriodEnd = start + interval_count * 7 * 24 * 60 * 60;
            break;
        case "month":
            const monthEnd = new Date(startDate);
            monthEnd.setMonth(monthEnd.getMonth() + interval_count);
            currentPeriodEnd = Math.floor(monthEnd.getTime() / 1000);
            break;
        case "year":
            const yearEnd = new Date(startDate);
            yearEnd.setFullYear(yearEnd.getFullYear() + interval_count);
            currentPeriodEnd = Math.floor(yearEnd.getTime() / 1000);
            break;
        default:
            throw new Error("Unknown interval");
    }

    const { error } = await supabase
        .from("profiles")
        .update({
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            stripe_price_id: item.price.id,
            current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),

        })
        .eq("stripe_customer_id", subscription.customer);

    if (error) console.error("Supabase update error:", error);
};

// Fonction principale webhook
export async function POST(req: NextRequest) {
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
        console.error("Webhook signature verification failed.", err);
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "customer.subscription.updated":
            case "customer.subscription.created":
                await handleSubscription(event.data.object as Stripe.Subscription);
                break;

            case "invoice.paid":
                // Ici tu peux gérer les factures payées si besoin
                console.log("Invoice paid:", event.data.object);
                break;

            case "invoice.payment_failed":
                console.log("Invoice payment failed:", event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (err) {
        console.error("Error handling Stripe event:", err);
        return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}