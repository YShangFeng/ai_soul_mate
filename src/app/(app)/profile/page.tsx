"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCompanion } from "@/hooks/use-companion";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { CompanionCard } from "@/components/profile/companion-card";
import { DaysCounter } from "@/components/profile/days-counter";
import { ShareCard } from "@/components/profile/share-card";
import { SubscriptionBadge } from "@/components/profile/subscription-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Loader2, Mail, Settings } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { companion, isLoading: isCompanionLoading } = useCompanion();
  const { plan, status, trialEndsAt } = useSubscription();

  useEffect(() => {
    if (!isCompanionLoading && !companion) {
      router.replace("/age-gate");
    }
  }, [isCompanionLoading, companion, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast({ title: "Welcome to VIP!", description: "Enjoy unlimited messages and more." });
      window.history.replaceState({}, "", "/profile");
    }
  }, []);

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

  if (!companion || !user) return null;

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "You";

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pb-24 pt-20">
      {/* ────────── User Profile Section ────────── */}
      <Card className="border-border/40 overflow-hidden">
        <CardContent className="flex items-center gap-4 pt-6">
          {/* User avatar — use companion avatar since user photo is deleted after generation */}
          <Avatar className="h-16 w-16 ring-2 ring-brand-purple/20">
            <AvatarImage src={companion.avatarUrl ?? ""} alt={userName} />
            <AvatarFallback className="bg-brand-purple/10 text-brand-purple text-lg font-medium">
              {userName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium truncate">{userName}</h2>
              <SubscriptionBadge plan={plan} status={status} trialEndsAt={trialEndsAt} />
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
          <Link href="/settings" className="shrink-0 rounded-lg p-2 hover:bg-muted transition-colors">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      {/* ────────── Companion Section ────────── */}
      <Card className="border-border/40 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Your Companion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CompanionCard
            name={companion.name}
            avatarUrl={companion.avatarUrl}
            relationship={companion.relationship}
            daysTogether={daysTogether}
          />
          <DaysCounter days={daysTogether} />
        </CardContent>
      </Card>

      {/* ────────── Share Section ────────── */}
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
