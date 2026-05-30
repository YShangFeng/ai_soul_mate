import { createClient } from "@/lib/supabase/server";

// ============================================
// Free Tier Limits
// ============================================

const FREE_DAILY_LIMIT = 10;

export interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  isPro: boolean;
}

/**
 * Check if a user has remaining message quota for today.
 * Free users get 10 messages/day. Pro users have unlimited.
 */
export async function checkMessageQuota(userId: string): Promise<QuotaResult> {
  const supabase = await createClient();

  // Check subscription plan
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single();

  const isPro = subscription?.plan === "pro";

  if (isPro) {
    return { allowed: true, used: 0, limit: Infinity, remaining: Infinity, isPro: true };
  }

  // Count today's user messages
  const today = new Date().toISOString().split("T")[0];

  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("companion_id", await getFirstCompanionId(userId, supabase))
    .eq("role", "user")
    .gte("created_at", `${today}T00:00:00Z`)
    .lte("created_at", `${today}T23:59:59Z`);

  const used = count ?? 0;
  const remaining = Math.max(0, FREE_DAILY_LIMIT - used);

  return {
    allowed: used < FREE_DAILY_LIMIT,
    used,
    limit: FREE_DAILY_LIMIT,
    remaining,
    isPro: false,
  };
}

/**
 * Increment the daily message count in the profiles table.
 */
export async function incrementMessageCount(userId: string): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("profiles")
    .update({ daily_messages_used: await getCurrentCount(userId) + 1 })
    .eq("id", userId);
}

async function getCurrentCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("daily_messages_used")
    .eq("id", userId)
    .single();
  return data?.daily_messages_used ?? 0;
}

async function getFirstCompanionId(
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  const { data } = await supabase
    .from("companions")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .single();
  return data?.id ?? "";
}
