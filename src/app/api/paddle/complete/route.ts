import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/paddle/complete
 * Called by frontend after Paddle checkout completes
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, transactionId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Upsert subscription record - activate pro
    const { error } = await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        plan: "pro",
        status: "active",
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Paddle complete error:", error);
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Paddle complete error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
