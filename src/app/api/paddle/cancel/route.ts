import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/paddle/cancel
 * Cancels the user's Paddle subscription via REST API, then downgrades DB.
 * Requires PADDLE_API_KEY env var.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get subscription record
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!sub) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    const paddleSubId = (sub as Record<string, string>).stripe_subscription_id;
    if (!paddleSubId) {
      return NextResponse.json({ error: "No Paddle subscription ID" }, { status: 400 });
    }

    const paddleApiKey = process.env.PADDLE_API_KEY;
    if (!paddleApiKey) {
      console.error("[Paddle Cancel] PADDLE_API_KEY env var not set");
      return NextResponse.json({ error: "Server not configured for cancellation. Please contact support." }, { status: 503 });
    }

    const isSandbox = process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox";
    const apiBase = isSandbox
      ? "https://sandbox-api.paddle.com"
      : "https://api.paddle.com";

    // Cancel via Paddle REST API
    const paddleRes = await fetch(`${apiBase}/subscriptions/${paddleSubId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paddleApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ effective_from: "immediately" }),
    });

    if (!paddleRes.ok) {
      const errBody = await paddleRes.text();
      console.error("[Paddle Cancel] API error:", { status: paddleRes.status, env: process.env.NEXT_PUBLIC_PADDLE_ENV, response: errBody.slice(0, 300) });
      return NextResponse.json({ error: `Paddle API error (${paddleRes.status}) — check PADDLE_API_KEY matches NEXT_PUBLIC_PADDLE_ENV` }, { status: 502 });
    }

    console.log("[Paddle Cancel] Paddle subscription canceled:", paddleSubId);

    // Downgrade to free in our DB
    await supabase
      .from("subscriptions")
      .update({
        plan: "free",
        status: "canceled",
        updated_at: new Date().toISOString(),
      } as never)
      .eq("user_id", userId);

    console.log("[Paddle Cancel] User", userId, "downgraded to free");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Paddle Cancel] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
