"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useSupabase } from "@/components/providers/supabase-provider";
import { SubscriptionBadge } from "@/components/profile/subscription-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Mail, LogOut, ArrowLeft, Key, Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { initializePaddle } from "@paddle/paddle-js";

export default function SettingsPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const { plan, subscription, status, trialEndsAt } = useSubscription();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

  /** Open Paddle's native cancellation flow (client-side, no API key needed) */
  async function handleCancelSubscription() {
    const paddleSubId = subscription?.stripeSubscriptionId;
    if (!paddleSubId) {
      toast({ title: "Subscription ID not available yet", description: "It may take a moment. Please refresh the page and try again.", variant: "destructive" });
      return;
    }
    setIsCanceling(true);
    try {
      const paddle = await initializePaddle({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
        environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as "sandbox" | "production") ?? "sandbox",
      });
      if (!paddle) throw new Error("Failed to load Paddle");

      // Try Retain cancellation flow first (requires Paddle Retain product)
      try {
        const result = await paddle.Retain.initCancellationFlow({ subscriptionId: paddleSubId });
        if (result.status === "chose_to_cancel") {
          toast({ title: "Subscription canceled", description: "Your plan has been downgraded to Free." });
          window.location.reload();
          return;
        } else if (result.status === "retained") {
          toast({ title: "Subscription kept", description: "Glad you're staying with us!" });
          return;
        }
        // "aborted" → user closed modal
      } catch (retainErr: unknown) {
        // Retain not available (common if Retain product not enabled), fallback to portal
        console.log("Retain not available, using portal fallback");
      }

      // Fallback: open Paddle Customer Portal in new tab
      const portalUrl = `https://${process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox" ? "sandbox-" : ""}paddle.com/subscriptions/${paddleSubId}`;
      window.open(portalUrl, "_blank");
      toast({ title: "Paddle Portal opened", description: "Please manage your subscription there, then return and refresh this page." });
    } catch (err) {
      console.error("Paddle cancel error:", err);
      toast({ title: "Something went wrong", description: "Please try again or contact support.", variant: "destructive" });
    } finally {
      setIsCanceling(false);
      setShowCancelConfirm(false);
    }
  }

  async function handleChangePassword() {
    const email = user?.email;
    if (!email) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Missing fields", description: "Please fill in all password fields.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "New password and confirmation must match.", variant: "destructive" });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) {
        toast({ title: "Incorrect password", description: "Current password is wrong.", variant: "destructive" });
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      toast({ title: "Password updated!", description: "Your password has been changed." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pb-24 pt-20">
      <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Account */}
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

      {/* Change Password */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5 text-brand-purple" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" disabled={isChangingPassword} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" disabled={isChangingPassword} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" disabled={isChangingPassword} />
          </div>
          <Button onClick={handleChangePassword} disabled={isChangingPassword} className="w-full gap-2">
            {isChangingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
            {isChangingPassword ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Cancel Subscription — Paddle native flow, no backend API */}
      {plan !== "free" && (
        <Card className="border-border/40 border-red-200 dark:border-red-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-600 dark:text-red-400">
              <Ban className="h-5 w-5" />
              Cancel Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showCancelConfirm ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Your {plan === "moon" ? "Moon" : "Starlight"} subscription will remain active until the end of the current billing period, then you'll be downgraded to Free.
                </p>
                <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800/30 dark:text-red-400 dark:hover:bg-red-950/20" onClick={() => setShowCancelConfirm(true)}>
                  Cancel My Subscription
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  This will open Paddle's cancellation flow — you can still change your mind there.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowCancelConfirm(false)} disabled={isCanceling}>
                    Keep Subscription
                  </Button>
                  <Button className="flex-1 gap-2 bg-red-600 hover:bg-red-700 text-white" onClick={handleCancelSubscription} disabled={isCanceling}>
                    {isCanceling && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isCanceling ? "Opening Paddle..." : "Continue to Cancel"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Logout */}
      <Button variant="outline" onClick={handleSignOut} className="w-full gap-2 text-muted-foreground hover:text-foreground">
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
