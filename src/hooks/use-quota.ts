"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";

// ============================================
// Types
// ============================================

export interface QuotaState {
  used: number;
  limit: number;
  remaining: number;
  isPro: boolean;
  isLoading: boolean;
}

// ============================================
// Hook
// ============================================

export function useQuota(): QuotaState & { refresh: () => Promise<void> } {
  const { supabase, user } = useSupabase();
  const [quota, setQuota] = useState<QuotaState>({
    used: 0,
    limit: 10,
    remaining: 10,
    isPro: false,
    isLoading: true,
  });

  const refresh = useCallback(async () => {
    if (!user) {
      setQuota((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Check subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan")
        .eq("user_id", user.id)
        .single();

      const isPro = sub?.plan === "pro";

      if (isPro) {
        setQuota({
          used: 0,
          limit: Infinity,
          remaining: Infinity,
          isPro: true,
          isLoading: false,
        });
        return;
      }

      // Count today's messages
      const today = new Date().toISOString().split("T")[0];

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("role", "user")
        .gte("created_at", `${today}T00:00:00Z`)
        .lte("created_at", `${today}T23:59:59Z`);

      const used = count ?? 0;
      const limit = 10;

      setQuota({
        used,
        limit,
        remaining: Math.max(0, limit - used),
        isPro: false,
        isLoading: false,
      });
    } catch {
      setQuota({
        used: 0,
        limit: 10,
        remaining: 10,
        isPro: false,
        isLoading: false,
      });
    }
  }, [supabase, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...quota, refresh };
}
