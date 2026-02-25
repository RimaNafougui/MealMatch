import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
        console.error("Webhook signature error:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;

                const customerId = session.customer as string;
                const plan = session.metadata?.plan;

                console.log("✅ Checkout completed:", plan);

                await updateProfile(customerId, {
                    plan,
                    subscription_status: "active",
                });

                break;
            }

            case "customer.subscription.updated": {
                const sub = event.data.object as Stripe.Subscription & {
                    current_period_end: number;
                };
                console.log("🔄 Subscription updated:", sub.status);

                if (!sub.current_period_end) {
                    console.log("⚠️ No current_period_end — skipping update");
                    break;
                }

                await supabase.from("profiles").update({
                    subscription_status: sub.status,
                    current_period_end: new Date(
                        sub.current_period_end * 1000
                    ).toISOString(),
                }).eq("stripe_customer_id", sub.customer as string);

                break;
            }

            case "customer.subscription.deleted": {
                const sub = event.data.object as Stripe.Subscription;

                console.log("❌ Subscription cancelled");

                await updateProfile(sub.customer as string, {
                    plan: "free",
                    subscription_status: "cancelled",
                });

                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;

                console.log("⚠️ Payment failed");

                await updateProfile(invoice.customer as string, {
                    subscription_status: "past_due",
                });

                break;
            }

            default:
                console.log("Ignored event:", event.type);
        }
    } catch (err) {
        console.error("Webhook handler error:", err);
        return NextResponse.json({ error: "Webhook error" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}