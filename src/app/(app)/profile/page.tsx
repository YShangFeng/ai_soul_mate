"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCompanion } from "@/hooks/use-companion";
import { useSubscription } from "@/hooks/use-subscription";
import { CompanionCard } from "@/components/profile/companion-card";
import { DaysCounter } from "@/components/profile/days-counter";
import { ShareCard } from "@/components/profile/share-card";
import { SubscriptionBadge } from "@/components/profile/subscription-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

/**
 * Profile Page — user's companion showcase.
 */
export default function ProfilePage() {
  const router = useRouter();
  const { companion, isLoading: isCompanionLoading } = useCompanion();
  const { plan, status, trialEndsAt } = useSubscription();

  // Redirect if no companion
  useEffect(() => {
    if (!isCompanionLoading && !companion) {
      router.replace("/age-gate");
    }
  }, [isCompanionLoading, companion, router]);

  // Show checkout success toast
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast({ title: "Welcome to Pro! 🎉", description: "Your subscription is now active." });
      window.history.replaceState({}, "", "/profile");
    }
  }, []);

  // Calculate days together
  const daysTogether = useMemo(() => {
    if (!companion?.createdAt) return 0;
    const created = new Date(companion.createdAt);
    const now = new Date();
    return Math.max(1, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
  }, [companion?.createdAt]);

  if (isCompanionLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (!companion) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pb-24 pt-20">
      {/* Subscription badge */}
      <div className="flex justify-center">
        <SubscriptionBadge plan={plan} status={status} trialEndsAt={trialEndsAt} />
      </div>

      {/* Companion card */}
      <CompanionCard
        name={companion.name}
        avatarUrl={companion.avatarUrl}
        relationship={companion.relationship}
        daysTogether={daysTogether}
      />

      {/* Days counter */}
      <Card className="border-border/40 overflow-hidden">
        <CardContent className="pt-6">
          <DaysCounter days={daysTogether} />
        </CardContent>
      </Card>

      {/* Share card */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-lg">Share Your Soul Mate</CardTitle>
        </CardHeader>
        <CardContent>
          <ShareCard
            companionName={companion.name}
            avatarUrl={companion.avatarUrl}
          />
        </CardContent>
      </Card>
    </div>
  );
}
