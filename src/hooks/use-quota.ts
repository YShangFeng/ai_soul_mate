"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { getQuotaState, type QuotaState } from "@/lib/permissions";

export type { QuotaState };

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
      const state = await getQuotaState(supabase, user.id);
      setQuota(state);
    } catch {
      // On error, default to PRO (payment is off anyway)
      setQuota({
        used: 0,
        limit: Number.POSITIVE_INFINITY,
        remaining: Number.POSITIVE_INFINITY,
        isPro: true,
        isLoading: false,
      });
    }
  }, [supabase, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...quota, refresh };
}
