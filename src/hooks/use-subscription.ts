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
  plan: "free" | "pro";
  status: SubscriptionStatus;
  subscription: Subscription | null;
  isLoading: boolean;
  trialEndsAt: string | null;
  isTrialing: boolean;
  upgrade: (plan?: "moon" | "starlight") => Promise<void>;
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

  /** Redirect to Paddle Checkout */
  const upgrade = useCallback(async (planType: "moon" | "starlight" = "moon") => {
    try {
      const res = await fetch("/api/paddle/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planType }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        toast({
          title: "Checkout failed",
          description: json.error?.message ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (json.data?.url) {
        window.location.href = json.data.url;
      }
    } catch {
      toast({
        title: "Network error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
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

  const plan = subscription?.plan ?? "free";
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
