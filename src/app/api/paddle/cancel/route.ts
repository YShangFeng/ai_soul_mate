import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/paddle/cancel
 * Cancels the user's active Paddle subscription and downgrades them to free.
 * 
 * Paddle API ref: https://developer.paddle.com/api-reference/subscriptions/cancel
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get the subscription record
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!sub) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    const paddleApiKey = process.env.PADDLE_API_KEY;
    const isSandbox = process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox";
    const apiBase = isSandbox
      ? "https://sandbox-api.paddle.com"
      : "https://api.paddle.com";

    // Cancel the subscription via Paddle REST API
    const subscriptionId = (sub as Record<string, string>).stripe_subscription_id;
    if (subscriptionId && paddleApiKey) {
      try {
        const res = await fetch(`${apiBase}/subscriptions/${subscriptionId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${paddleApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "canceled" }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          console.error("[Paddle Cancel] Paddle API error:", res.status, errBody);
          // Continue with DB update even if Paddle API fails
        } else {
          console.log("[Paddle Cancel] Paddle subscription canceled:", subscriptionId);
        }
      } catch (err) {
        console.error("[Paddle Cancel] Paddle API call failed:", err);
        // Continue with DB update
      }
    }

    // Downgrade to free in our DB
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        plan: "free",
        status: "canceled",
        updated_at: new Date().toISOString(),
      } as never)
      .eq("user_id", userId);

    if (updateError) {
      console.error("[Paddle Cancel] DB update error:", updateError);
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
    }

    console.log("[Paddle Cancel] User", userId, "canceled subscription");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Paddle Cancel] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
