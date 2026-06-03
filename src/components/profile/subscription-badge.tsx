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
  if (plan === "pro") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-950">
        <Crown className="h-3 w-3" />
        Pro
      </span>
    );
  }

  return (
    <Link
      href="/pricing"
      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      Free
    </Link>
  );
}
