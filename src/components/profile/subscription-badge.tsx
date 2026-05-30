"use client";

import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";

interface SubscriptionBadgeProps {
  plan: "free" | "pro";
  status: string;
  trialEndsAt: string | null;
}

export function SubscriptionBadge({
  plan,
  status,
  trialEndsAt,
}: SubscriptionBadgeProps) {
  const isPro = plan === "pro";

  if (isPro) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-950">
        <Crown className="h-3 w-3" />
        VIP
      </span>
    );
  }

  return (
    <Link
      href="/settings"
      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-purple to-brand-pink px-2.5 py-0.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
    >
      <Sparkles className="h-3 w-3" />
      VIP
    </Link>
  );
}
