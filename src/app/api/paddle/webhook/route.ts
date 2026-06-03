import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("paddle-signature") ?? "";

    console.log("[Paddle Webhook] signature header:", signature.slice(0, 80));

    if (WEBHOOK_SECRET && signature) {
      const parts = signature.split(";");
      const ts = parts.find((p) => p.startsWith("ts="))?.slice(3) ?? "";
      const actualSig = parts.find((p) => p.startsWith("h1="))?.slice(3);

      const crypto = await import("crypto");
      const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
      hmac.update(`${ts}:${body}`);
      const expected = hmac.digest("hex");

      console.log("[Paddle Webhook] ts:", ts, "expected:", expected.slice(0, 20), "actual:", actualSig?.slice(0, 20));

      if (!actualSig || expected !== actualSig) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    const event = JSON.parse(body);
    console.log("[Paddle Webhook] Full event:", JSON.stringify(event).slice(0, 500));

    if (event.event_type !== "transaction.completed") {
      console.log("[Paddle Webhook] Skipping non-transaction event:", event.event_type);
      return NextResponse.json({ received: true });
    }

    const transactionId = event.data?.id;
    // custom_data may be at different paths depending on event type
    const customData =
      event.data?.custom_data ??
      event.data?.transaction?.custom_data ??
      {};
    const userId = customData.user_id as string | undefined;

    console.log("[Paddle Webhook] customData:", JSON.stringify(customData), "userId:", userId);

    if (!userId) {
      console.error("[Paddle Webhook] No user_id in custom_data");
      return NextResponse.json({ error: "No user_id" }, { status: 400 });
    }

    const supabase = createAdminClient();

    await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        plan: "pro",
        status: "active",
        paddle_transaction_id: transactionId ?? "",
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id" },
    );

    console.log(`[Paddle Webhook] Activated pro for user ${userId}`);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Paddle Webhook] Error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
