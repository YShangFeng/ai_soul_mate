// @ts-nocheck - https://github.com/supabase/ssr/issues - SSR 0.5.2 GenericSchema bug
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for subscription lifecycle management.
 * Uses admin Supabase client to bypass RLS.
 */
export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      // ---- Checkout completed ----
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const subscriptionId = session.subscription as string;

        if (!userId || !subscriptionId) {
          console.error("Missing user_id or subscription_id in session metadata");
          break;
        }

        // Fetch subscription details from Stripe
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

        await supabase
          .from("subscriptions")
          .update({
            stripe_subscription_id: subscriptionId,
            status: stripeSub.status === "trialing" ? "trialing" : "active",
            plan: moon,
            trial_ends_at: stripeSub.trial_end
              ? new Date(stripeSub.trial_end * 1000).toISOString()
              : null,
            current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          })
          .eq("user_id", userId);
        break;
      }

      // ---- Subscription updated ----
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          // Try to find by stripe_subscription_id
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", subscription.id)
            .single();

          if (!sub) break;

          const status = mapStripeStatus(subscription.status);

          // If canceled/past_due/unpaid, downgrade
          const isActive = status === "active" || status === "trialing";

          await supabase
            .from("subscriptions")
            .update({
              status,
              plan: isActive ? moon : "free",
              trial_ends_at: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", sub.user_id);
          break;
        }

        const status = mapStripeStatus(subscription.status);
        const isActive = status === "active" || status === "trialing";

        await supabase
          .from("subscriptions")
          .update({
            status,
            plan: isActive ? moon : "free",
            trial_ends_at: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("user_id", userId);
        break;
      }

      // ---- Subscription deleted ----
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (sub) {
          await supabase
            .from("subscriptions")
            .update({
              status: "canceled",
              plan: "free",
              stripe_subscription_id: null,
              current_period_end: null,
            })
            .eq("user_id", sub.user_id);
        }
        break;
      }

      default:
        // Unhandled event type — silently ignored
        break;
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

// ============================================
// Helpers
// ============================================

function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status,
): string {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return "canceled";
    default:
      return "canceled";
  }
}
