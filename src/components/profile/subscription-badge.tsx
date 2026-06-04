"use client";

import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";

function daysRemaining(endDate: string | null): string {
  if (!endDate) return "";
  const now = Date.now();
  const end = new Date(endDate).getTime();
  const diff = end - now;
  if (diff <= 0) return "";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 1) return " · ends today";
  return ` · ${days} days left`;
}

interface SubscriptionBadgeProps {
  plan: "free" | "moon" | "starlight";
  status: string;
  trialEndsAt: string | null;
  currentPeriodEnd?: string | null;
}

export function SubscriptionBadge({
  plan,
  status,
  trialEndsAt,
  currentPeriodEnd,
}: SubscriptionBadgeProps) {
  const remaining = status === "canceled" ? daysRemaining(currentPeriodEnd ?? null) : "";

  if (plan === "starlight") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-400 to-purple-400 px-2.5 py-0.5 text-xs font-semibold text-white">
        <Sparkles className="h-3 w-3" />
        Starlight{remaining}
      </span>
    );
  }

  if (plan === "moon") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-950">
        <Crown className="h-3 w-3" />
        Moon{remaining}
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
