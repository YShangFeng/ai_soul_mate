"use client";

import { useState, useEffect } from "react";

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
// Hook — always VIP (payment system not yet enabled)
// ============================================

export function useQuota(): QuotaState & { refresh: () => Promise<void> } {
  const [quota] = useState<QuotaState>({
    used: 0,
    limit: Infinity,
    remaining: Infinity,
    isPro: true,
    isLoading: false,
  });

  // Still provide a refresh function in case we add payments later
  const refresh = async () => {};

  // Prevent the "setState during render" edge case
  useEffect(() => {}, []);

  return { ...quota, refresh };
}
