import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Paddle webhook — handle one-time purchase completions.
 * Webhook events: transaction.completed
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  console.log("Paddle webhook:", body.event_type, body.data?.id);

  try {
    // Only process completed transactions
    if (body.event_type !== "transaction.completed") {
      return NextResponse.json({ ok: true });
    }

    const transaction = body.data;

    // Extract user_id from passthrough or custom_data
    const passthrough = transaction.passthrough
      ? (typeof transaction.passthrough === "string" ? JSON.parse(transaction.passthrough) : transaction.passthrough)
      : {};
    const userId = passthrough.user_id as string | undefined;

    if (!userId) {
      console.error("Paddle webhook: no user_id found");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Upsert subscription record
    const { error } = await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        plan: "pro",
        status: "active",
        paddle_transaction_id: transaction.id ?? "",
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id" },
    );

    if (error) {
      console.error("Paddle webhook: upsert failed", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    console.log(`Paddle webhook: activated pro for user ${userId}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Paddle webhook error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
