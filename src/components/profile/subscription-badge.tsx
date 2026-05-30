"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Crown, ArrowRight, Clock } from "lucide-react";

// ============================================
// Types
// ============================================

interface SubscriptionBadgeProps {
  plan: "free" | "pro";
  status: string;
  trialEndsAt: string | null;
}

// ============================================
// Component
// ============================================

export function SubscriptionBadge({
  plan,
  status,
  trialEndsAt,
}: SubscriptionBadgeProps) {
  const isPro = plan === "pro";
  const isTrialing = status === "trialing";

  if (isPro) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
        <Crown className="h-4 w-4 text-amber-400" />
        <span className="text-sm font-medium text-amber-400">Pro Member</span>
        {isTrialing && (
          <span className="text-xs text-muted-foreground">
            · Trial ends{" "}
            {trialEndsAt
              ? new Date(trialEndsAt).toLocaleDateString()
              : "soon"}
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/settings"
      className="flex items-center gap-2 rounded-full border border-border/40 bg-muted/50 px-3 py-1.5 transition-colors hover:bg-muted"
    >
      <Badge variant="secondary" className="text-xs font-normal">
        Free
      </Badge>
      <span className="text-xs text-muted-foreground">Upgrade to Pro</span>
      <ArrowRight className="h-3 w-3 text-muted-foreground" />
    </Link>
  );
}
