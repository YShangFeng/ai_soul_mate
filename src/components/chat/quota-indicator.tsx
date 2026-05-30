"use client";

import Link from "next/link";
import { MessageSquare, Infinity, ArrowRight } from "lucide-react";

// ============================================
// Types
// ============================================

interface QuotaIndicatorProps {
  used: number;
  limit: number;
  remaining: number;
  isPro: boolean;
  isLoading: boolean;
}

// ============================================
// Component
// ============================================

export function QuotaIndicator({
  used,
  limit,
  remaining,
  isPro,
  isLoading,
}: QuotaIndicatorProps) {
  if (isLoading) return null;

  if (isPro) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-brand-purple">
        <Infinity className="h-3 w-3" />
        <span>Unlimited messages</span>
      </div>
    );
  }

  const percentage = limit > 0 ? (remaining / limit) * 100 : 0;
  const isLow = remaining <= 3;

  return (
    <Link
      href="/pricing"
      className="group flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-muted/50 transition-colors"
    >
      <MessageSquare className={`h-3.5 w-3.5 ${isLow ? "text-brand-rose" : "text-muted-foreground"}`} />
      <div className="flex-1">
        {/* Progress bar */}
        <div className="mb-0.5 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              isLow ? "bg-brand-rose" : "bg-brand-purple"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-[10px] ${isLow ? "text-brand-rose font-medium" : "text-muted-foreground"}`}>
          {remaining}/{limit} messages remaining
        </span>
      </div>
      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}
