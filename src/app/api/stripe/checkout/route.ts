import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session or Customer Portal session.
 *
 * Body: { mode?: "payment" | "portal", priceId?: string }
 * - "payment" (default): Creates a checkout session for subscription
 * - "portal": Creates a customer portal session
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to upgrade." } },
      { status: 401 },
    );
  }

  // Get user profile for email
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  const body = await request.json().catch(() => ({}));
  const mode = body.mode ?? "payment";
  const priceId = body.priceId ?? process.env.STRIPE_PRO_MONTHLY_PRICE_ID;

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Get or create Stripe customer
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let customerId = subscription?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;

    // Save customer ID
    await supabase
      .from("subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);
  }

  // Customer Portal mode
  if (mode === "portal") {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings`,
    });

    return NextResponse.json({ data: { url: portalSession.url } });
  }

  // Checkout mode
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 3,
      metadata: { user_id: user.id },
    },
    allow_promotion_codes: true,
    success_url: `${origin}/profile?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=canceled`,
    metadata: { user_id: user.id },
  });

  return NextResponse.json({ data: { url: session.url } });
}
