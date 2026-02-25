import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper pour mettre à jour le profil
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
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error("⚠️ Webhook signature error:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            // -----------------------
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const customerId = session.customer as string;
                const plan = session.metadata?.plan || "free";

                console.log("✅ Checkout completed for plan:", plan);

                await updateProfile(customerId, {
                    plan,
                    subscription_status: "active",
                });
                break;
            }

            // -----------------------
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const sub = event.data.object as Stripe.Subscription & {
                    current_period_end: number;
                }; const customerId = sub.customer as string;

                // Calcul du plan à partir du price_id
                const priceId = sub.items.data[0].price.id;
                let plan: string = "free";
                if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDENT) plan = "student";
                if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM) plan = "premium";

                // Calcul current_period_end sûr
                let currentPeriodEnd: string | null = null;
                if (sub.current_period_end) {
                    currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
                } else {
                    // fallback si current_period_end absent
                    const interval = sub.items.data[0].price.recurring?.interval || "month";
                    const start = sub.start_date || Math.floor(Date.now() / 1000);
                    let endDate = new Date(start * 1000);
                    switch (interval) {
                        case "day": endDate.setDate(endDate.getDate() + 1); break;
                        case "week": endDate.setDate(endDate.getDate() + 7); break;
                        case "month": endDate.setMonth(endDate.getMonth() + 1); break;
                        case "year": endDate.setFullYear(endDate.getFullYear() + 1); break;
                    }
                    currentPeriodEnd = endDate.toISOString();
                }

                console.log(`🔄 Subscription updated: ${plan} / ${sub.status}`);

                await updateProfile(customerId, {
                    plan,
                    subscription_status: sub.status,
                    stripe_price_id: priceId,
                    current_period_end: currentPeriodEnd,
                });
                break;
            }

            // -----------------------
            case "customer.subscription.deleted": {
                const sub = event.data.object as Stripe.Subscription;
                console.log("❌ Subscription cancelled");
                await updateProfile(sub.customer as string, {
                    plan: "free",
                    subscription_status: "cancelled",
                });
                break;
            }

            // -----------------------
            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                console.log("⚠️ Payment failed");
                await updateProfile(invoice.customer as string, {
                    subscription_status: "past_due",
                });
                break;
            }

            // -----------------------
            default:
                console.log("Ignored event:", event.type);
        }
    } catch (err) {
        console.error("❌ Webhook handler error:", err);
        return NextResponse.json({ error: "Webhook error" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}