import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("paddle-signature") ?? "";

    if (WEBHOOK_SECRET && signature) {
      const parts = signature.split(";");
      const ts = parts.find((p) => p.startsWith("ts="))?.slice(3) ?? "";
      const actualSig = parts.find((p) => p.startsWith("h1="))?.slice(3);

      const crypto = await import("crypto");
      const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
      hmac.update(`${ts}:${body}`);
      if (hmac.digest("hex") !== actualSig) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    const event = JSON.parse(body);
    const eventType = event.event_type as string;
    const userId = event.data?.custom_data?.user_id as string | undefined;
    const subscriptionId = event.data?.id as string | undefined;

    if (!userId) {
      console.error("[Paddle Webhook] No user_id in custom_data");
      return NextResponse.json({ error: "No user_id" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // --- Subscription Canceled ---
    if (eventType === "subscription.canceled") {
      console.log("[Paddle Webhook] Canceling subscription for user", userId);
      await supabase.from("subscriptions").update({
        plan: "free",
        status: "canceled",
        updated_at: new Date().toISOString(),
      } as never).eq("user_id", userId);
      console.log(`[Paddle Webhook] User ${userId} downgraded to free`);
      return NextResponse.json({ received: true });
    }

    // --- Subscription Activated / Created ---
    if (eventType !== "subscription.activated" && eventType !== "subscription.created") {
      console.log("[Paddle Webhook] Skipping:", eventType);
      return NextResponse.json({ received: true });
    }

    const customTier = event.data?.custom_data?.tier as string | undefined;
    const priceId = (event.data?.items?.[0]?.price?.id ?? "") as string;
    const starlightPriceId = process.env.NEXT_PUBLIC_PADDLE_STARLIGHT_PRICE_ID ?? "";
    const plan: "moon" | "starlight" =
      customTier === "starlight" || priceId === starlightPriceId ? "starlight" : "moon";

    console.log("[Paddle Webhook]", eventType, "userId:", userId, "plan:", plan);

    // Upsert subscription record
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase.from("subscriptions").update({
        plan,
        status: "active",
        updated_at: new Date().toISOString(),
      } as never).eq("user_id", userId);
    } else {
      await supabase.from("subscriptions").insert({
        user_id: userId,
        plan,
        status: "active",
        updated_at: new Date().toISOString(),
      } as never);
    }

    console.log(`[Paddle Webhook] Activated ${plan} for user ${userId}`);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Paddle Webhook] Error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
