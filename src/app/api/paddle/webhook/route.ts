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

    // Only handle subscription activation/creation
    if (eventType !== "subscription.activated" && eventType !== "subscription.created") {
      console.log("[Paddle Webhook] Skipping:", eventType);
      return NextResponse.json({ received: true });
    }

    const userId = event.data?.custom_data?.user_id as string | undefined;
    const subscriptionId = event.data?.id as string | undefined;

    console.log("[Paddle Webhook]", eventType, "userId:", userId, "subId:", subscriptionId);

    if (!userId) {
      console.error("[Paddle Webhook] No user_id in custom_data");
      return NextResponse.json({ error: "No user_id" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if subscription record exists
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase.from("subscriptions").update({
        plan: "pro",
        status: "active",
        paddle_sub_id: subscriptionId,
        updated_at: new Date().toISOString(),
      } as never).eq("user_id", userId);
    } else {
      await supabase.from("subscriptions").insert({
        user_id: userId,
        plan: "pro",
        status: "active",
        paddle_sub_id: subscriptionId,
        updated_at: new Date().toISOString(),
      } as never);
    }

    console.log(`[Paddle Webhook] Activated pro for user ${userId}`);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Paddle Webhook] Error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
