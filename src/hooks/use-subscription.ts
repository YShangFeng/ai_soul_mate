"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { mapSubscriptionRow, type Subscription, type SubscriptionStatus } from "@/types/subscription";
import { toast } from "@/components/ui/toast";

// ============================================
// Types
// ============================================

interface UseSubscriptionReturn {
  plan: "free" | "moon" | "starlight";
  status: SubscriptionStatus;
  subscription: Subscription | null;
  isLoading: boolean;
  trialEndsAt: string | null;
  isTrialing: boolean;
  upgrade: () => Promise<void>;
  manage: () => Promise<void>;
}

// ============================================
// Hook
// ============================================

export function useSubscription(): UseSubscriptionReturn {
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code !== "PGRST116") console.error("Subscription fetch error:", error);
        setSubscription(null);
      } else if (data) {
        setSubscription(mapSubscriptionRow(data));
      }
    } catch {
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  /** Navigate to pricing page */
  const upgrade = useCallback(async () => {
    window.location.href = "/pricing";
  }, []);

  /** Redirect to Stripe Customer Portal */
  const manage = useCallback(async () => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "portal" }),
      });

      const json = await res.json();

      if (json.data?.url) {
        window.location.href = json.data.url;
      } else {
        toast({
          title: "Could not open portal",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  const rawPlan = (subscription?.plan as string) ?? "free";
  // Normalize: legacy "pro" → "moon"
  const plan: "free" | "moon" | "starlight" =
    rawPlan === "starlight" ? "starlight" :
    rawPlan === "moon" || rawPlan === "pro" ? "moon" : "free";
  const status = subscription?.status ?? "active";
  const isTrialing = status === "trialing";

  return {
    plan,
    status,
    subscription,
    isLoading,
    trialEndsAt: subscription?.trialEndsAt ?? null,
    isTrialing,
    upgrade,
    manage,
  };
}
