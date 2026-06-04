import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/paddle/complete
 * Called by frontend after Paddle checkout completes
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, transactionId, tier } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Validate tier: moon or starlight (default to moon for safety)
    const plan = tier === "starlight" ? "starlight" : "moon";

    // Calculate approximate period end (webhook will overwrite with exact value)
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan === "starlight") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const supabase = createAdminClient();

    // Upsert subscription record
    const { error } = await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        plan,
        status: "active",
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Paddle complete error:", error);
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
    }

    console.log(`[Paddle Complete] Activated ${plan} for user ${userId}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Paddle complete error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
