// /app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServer } from "@/utils/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook signature failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    try {
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted": {

                const subscription = event.data.object as any;

                const customerId = subscription.customer as string;
                const priceId = subscription.items.data[0]?.price.id;

                if (!priceId) {
                    console.error("No priceId in subscription");
                    break;
                }

                // 🔁 Map Stripe price → internal plan
                let plan: "free" | "student" | "premium" = "free";

                if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDENT) {
                    plan = "student";
                }

                if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM) {
                    plan = "premium";
                }

                // Si subscription inactive → downgrade
                if (
                    subscription.status !== "active" &&
                    subscription.status !== "trialing"
                ) {
                    plan = "free";
                }

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("stripe_customer_id", customerId)
                    .single();

                if (!profile) {
                    console.error("Profile not found for customer:", customerId);
                    break;
                }

                await supabase
                    .from("profiles")
                    .update({
                        plan,
                        stripe_subscription_id: subscription.id,
                        stripe_price_id: priceId,
                        subscription_status: subscription.status,
                        current_period_end: subscription.current_period_end
                            ? new Date(
                                subscription.current_period_end * 1000
                            ).toISOString()
                            : null,
                    })
                    .eq("id", profile.id);

                console.log("Subscription synced:", profile.id);
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("stripe_customer_id", customerId)
                    .single();

                if (!profile) break;

                await supabase
                    .from("profiles")
                    .update({
                        plan: "free",
                        subscription_status: "past_due",
                    })
                    .eq("id", profile.id);

                console.log("Payment failed → downgraded:", profile.id);
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (err) {
        console.error("Webhook handler error:", err);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}