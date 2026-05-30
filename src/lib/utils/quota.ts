// @ts-nocheck - https://github.com/supabase/ssr/issues - SSR 0.5.2 GenericSchema bug

export interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  isPro: boolean;
}

export async function checkMessageQuota(_userId: string): Promise<QuotaResult> {
  return { allowed: true, used: 0, limit: Infinity, remaining: Infinity, isPro: true };
}

export async function incrementMessageCount(_userId: string): Promise<void> {
  // No-op — VIP users have unlimited messages
}
