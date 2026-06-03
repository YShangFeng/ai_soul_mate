import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Paddle Webhook — handles transaction.completed for one-time purchases.
 * Webhook URL: https://aisoulmate.chat/api/paddle/webhook
 */
export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("paddle-signature") ?? "";

    if (WEBHOOK_SECRET && signature) {
      const crypto = await import("crypto");
      const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
      hmac.update(body);
      const expected = hmac.digest("hex");
      const parts = signature.split(";");
      const actualSig = parts.find((p) => p.startsWith("h1="))?.slice(3);
      if (!actualSig || expected !== actualSig) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    const event = JSON.parse(body);

    if (event.event_type !== "transaction.completed") {
      return NextResponse.json({ received: true });
    }

    const transactionId = event.data?.id;
    const customData = event.data?.custom_data ?? {};
    const userId = customData.user_id as string | undefined;

    if (!userId) {
      console.error("[Paddle Webhook] No user_id in custom_data");
      return NextResponse.json({ error: "No user_id" }, { status: 400 });
    }

    const supabase = await createClient();

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
