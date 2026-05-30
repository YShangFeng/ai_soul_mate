"use client";

import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionBadge } from "@/components/profile/subscription-badge";
import { SubscriptionPanel } from "@/components/settings/subscription-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Mail, LogOut, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const { plan, status, trialEndsAt } = useSubscription();

  if (isAuthLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "You";

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pb-24 pt-20">
      {/* Back button */}
      <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* User Info */}
      <Card className="border-border/40 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-brand-purple/20">
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
        </CardContent>
      </Card>

      {/* Subscription Info */}
      <SubscriptionPanel />

      {/* Logout */}
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="w-full gap-2 text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
