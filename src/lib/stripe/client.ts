import Stripe from "stripe";

/**
 * Stripe server-side client (singleton).
 * Uses STRIPE_SECRET_KEY from environment variables.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil" as Stripe.LatestApiVersion,
  typescript: true,
});
