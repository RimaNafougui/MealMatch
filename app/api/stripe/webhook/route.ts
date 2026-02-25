// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function updateProfile(customerId: string, data: any) {
    const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("stripe_customer_id", customerId);
    if (error) console.error("Supabase update error:", error);
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
        console.error("Webhook signature invalide:", err);
        return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const customerId = session.customer as string;
                const plan = session.metadata?.plan || "free";

                console.log("✅ Checkout terminé pour le plan:", plan);

                await updateProfile(customerId, { plan, subscription_status: "active" });
                break;
            }

            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const sub = event.data.object as Stripe.Subscription & { current_period_end: number };
                const customerId = sub.customer as string;
                const priceId = sub.items.data[0].price.id;

                // Détermine le plan serveur à partir du priceId
                let plan: string = "free";
                if (priceId === process.env.STRIPE_PRICE_STUDENT) plan = "student";
                if (priceId === process.env.STRIPE_PRICE_PREMIUM) plan = "premium";

                const currentPeriodEnd = sub.current_period_end
                    ? new Date(sub.current_period_end * 1000).toISOString()
                    : null;

                console.log(`🔄 Subscription mise à jour: ${plan} / ${sub.status}`);

                await updateProfile(customerId, {
                    plan,
                    subscription_status: sub.status,
                    stripe_price_id: priceId,
                    current_period_end: currentPeriodEnd,
                });
                break;
            }

            case "customer.subscription.deleted": {
                const sub = event.data.object as Stripe.Subscription;
                console.log("❌ Subscription annulée");
                await updateProfile(sub.customer as string, { plan: "free", subscription_status: "cancelled" });
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                console.log("⚠️ Payment failed");
                await updateProfile(invoice.customer as string, { subscription_status: "past_due" });
                break;
            }

            default:
                console.log("Événement ignoré:", event.type);
        }
    } catch (err) {
        console.error("Erreur webhook:", err);
        return NextResponse.json({ error: "Erreur serveur webhook" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}