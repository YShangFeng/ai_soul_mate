// @ts-nocheck - https://github.com/supabase/ssr/issues - SSR 0.5.2 GenericSchema bug

// ============================================
// 权限中心 — 整个应用唯一的配额/功能开关
// ============================================
//
// 将来接入支付系统时，只需：
//   1. PAYMENT_ENABLED 改为 true
//   2. 所有 API route 和前端 hook 无需修改
//
// ⚠️ 此文件不 import server.ts，确保客户端代码也可安全引用
//    所有函数接收 supabase client 作为参数，由调用方提供
//
// ============================================

// ============================================
// 🔧 主开关：支付系统是否启用
//    false → 所有用户享受 PRO 权限
//    true  → 根据 subscriptions 表区分 free/pro
// ============================================
const PAYMENT_ENABLED = true;

// ============================================
// 限额配置
// ============================================
export const LIMITS = {
  FREE: {
    chatMessagesPerDay: 10,
    avatarGenerationsPerDay: 3,
    maxCompanions: 2,
  },
  PRO: {
    chatMessagesPerDay: Number.POSITIVE_INFINITY,
    avatarGenerationsPerDay: Number.POSITIVE_INFINITY,
    maxCompanions: 10,
  },
} as const;

// ============================================
// 结果类型
// ============================================
export interface FeatureCheck {
  allowed: boolean;
  reason?: string;
  limit: number;
  used: number;
  remaining: number;
}

export interface QuotaState {
  used: number;
  limit: number;
  remaining: number;
  isPro: boolean;
  isLoading: boolean;
}

// Supabase client type — intentionally loose to avoid SSR 0.5.2 GenericSchema issues
// eslint-disable-next-line
type SupabaseClient = any;

// ============================================
// 内部：判断用户等级（接收 supabase client）
// ============================================
async function getUserTier(
  supabase: SupabaseClient,
  userId: string,
): Promise<"pro" | "free"> {
  if (!PAYMENT_ENABLED) return "pro";

  const { data } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single();

  return (data as { plan?: string } | null)?.plan === "pro" ? "pro" : "free";
}

// ============================================
// 1. 聊天配额检查
// ============================================
export async function checkChatQuota(
  userId: string,
  supabase: SupabaseClient,
): Promise<FeatureCheck> {
  const tier = await getUserTier(supabase, userId);
  const limit = LIMITS[tier === "pro" ? "PRO" : "FREE"].chatMessagesPerDay;

  if (limit === Number.POSITIVE_INFINITY) {
    return { allowed: true, limit: Number.POSITIVE_INFINITY, used: 0, remaining: Number.POSITIVE_INFINITY };
  }

  const today = new Date().toISOString().split("T")[0];
  const q = supabase.from("messages").select("*", { count: "exact", head: true })
    .eq("role", "user")
    // @ts-ignore — chained filters
    .gte("created_at", `${today}T00:00:00Z`)
    // @ts-ignore
    .lte("created_at", `${today}T23:59:59Z`);
  const result = await q as { count: number };
  const used = result.count ?? 0;
  const remaining = Math.max(0, limit - used);

  return {
    allowed: used < limit,
    reason: used >= limit ? `Daily message limit reached (${limit}/day)` : undefined,
    limit,
    used,
    remaining,
  };
}

// ============================================
// 2. 伴侣创建检查
// ============================================
export async function checkCompanionLimit(
  userId: string,
  supabase: SupabaseClient,
): Promise<FeatureCheck> {
  const tier = await getUserTier(supabase, userId);
  const maxCompanions = LIMITS[tier === "pro" ? "PRO" : "FREE"].maxCompanions;

  const result = await supabase
    .from("companions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId) as { count: number };
  const used = result.count ?? 0;
  const remaining = Math.max(0, maxCompanions - used);

  return {
    allowed: used < maxCompanions,
    reason: used >= maxCompanions ? `You can create up to ${maxCompanions} companions.` : undefined,
    limit: maxCompanions,
    used,
    remaining,
  };
}

// ============================================
// 3. 头像生成配额检查
// ============================================
export async function checkAvatarQuota(
  userId: string,
  supabase: SupabaseClient,
): Promise<FeatureCheck> {
  const tier = await getUserTier(supabase, userId);
  const limit = LIMITS[tier === "pro" ? "PRO" : "FREE"].avatarGenerationsPerDay;

  if (limit === Number.POSITIVE_INFINITY) {
    return { allowed: true, limit: Number.POSITIVE_INFINITY, used: 0, remaining: Number.POSITIVE_INFINITY };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_generations_used")
    .eq("id", userId)
    .single();

  const used = (profile as { daily_generations_used?: number } | null)?.daily_generations_used ?? 0;
  const remaining = Math.max(0, limit - used);

  return {
    allowed: used < limit,
    reason: used >= limit ? `Daily generation limit reached (${limit}/day)` : undefined,
    limit,
    used,
    remaining,
  };
}

// ============================================
// 4. 前端配额状态（useQuota hook 用）
// ============================================
export async function getQuotaState(
  supabase: SupabaseClient,
  userId: string,
): Promise<QuotaState> {
  const tier = await getUserTier(supabase, userId);
  const isPro = tier === "pro";

  if (isPro) {
    return { used: 0, limit: Number.POSITIVE_INFINITY, remaining: Number.POSITIVE_INFINITY, isPro: true, isLoading: false };
  }

  const limit = LIMITS.FREE.chatMessagesPerDay;
  const today = new Date().toISOString().split("T")[0];
  const q = supabase.from("messages").select("*", { count: "exact", head: true })
    .eq("role", "user")
    // @ts-ignore
    .gte("created_at", `${today}T00:00:00Z`)
    // @ts-ignore
    .lte("created_at", `${today}T23:59:59Z`);
  const result = await q as { count: number };
  const used = result.count ?? 0;

  return { used, limit, remaining: Math.max(0, limit - used), isPro: false, isLoading: false };
}

// ============================================
// 5. 增量计数（头像生成后用）
// ============================================
export async function incrementAvatarUsage(
  userId: string,
  supabase: SupabaseClient,
): Promise<void> {
  if (!PAYMENT_ENABLED) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_generations_used")
    .eq("id", userId)
    .single();

  await supabase
    .from("profiles")
    .update({ daily_generations_used: ((profile as { daily_generations_used?: number } | null)?.daily_generations_used ?? 0) + 1 })
    .eq("id", userId);
}
