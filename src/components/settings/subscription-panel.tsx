"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Infinity, Sparkles, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";

// ============================================
// Component
// ============================================

export function SubscriptionPanel() {
  const {
    plan,
    status,
    isTrialing,
    trialEndsAt,
    isLoading,
    upgrade,
    manage,
  } = useSubscription();

  if (isLoading) {
    return (
      <Card className="border-border/40">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown
            className={`h-5 w-5 ${plan === "pro" ? "text-amber-400" : "text-muted-foreground"}`}
          />
          Subscription
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current plan */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {plan === "pro" ? "Pro" : "Free"}
              </span>
              {plan === "pro" && (
                <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <Crown className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              )}
              {isTrialing && (
                <Badge variant="secondary" className="text-xs">
                  Trial
                </Badge>
              )}
            </div>
            {isTrialing && trialEndsAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Trial ends {new Date(trialEndsAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Feature comparison */}
        <div className="space-y-2 rounded-lg bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span>Daily Messages</span>
            <span className="font-medium">
              {plan === "pro" ? (
                <Infinity className="inline h-4 w-4 text-brand-purple" />
              ) : (
                "10 / day"
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Avatar Regenerations</span>
            <span className="font-medium">
              {plan === "pro" ? (
                <Infinity className="inline h-4 w-4 text-brand-purple" />
              ) : (
                "3 / day"
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Companions</span>
            <span className="font-medium">{plan === "pro" ? "Up to 5" : "1"}</span>
          </div>
          <hr className="border-border/30" />
          <div className="flex items-center justify-between text-sm">
            <span>Price</span>
            <span className="font-medium">
              {plan === "pro" ? "$9.99/mo" : "Free"}
            </span>
          </div>
        </div>

        {/* Pro features list */}
        {plan === "free" && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-brand-purple flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Unlock Pro Features:
            </p>
            <ul className="space-y-1.5">
              {[
                "Unlimited messages every day",
                "Unlimited avatar regenerations",
                "Up to 5 AI companions",
                "Priority AI response generation",
                "3-day free trial",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-purple" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {plan === "free" ? (
            <Button onClick={upgrade} className="flex-1 gap-2">
              <Crown className="h-4 w-4" />
              Start 3-Day Free Trial
            </Button>
          ) : (
            <Button onClick={manage} variant="outline" className="flex-1 gap-2">
              Manage Subscription
            </Button>
          )}
        </div>

        {/* Trial info */}
        {plan === "free" && (
          <p className="text-center text-xs text-muted-foreground">
            $9.99/month after trial · Cancel anytime ·{" "}
            <button onClick={upgrade} className="underline hover:text-foreground">
              $2.99/week also available
            </button>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
