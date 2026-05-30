"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Check, Infinity, Sparkles } from "lucide-react";

export function SubscriptionPanel() {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-amber-400" />
          VIP Membership
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                VIP
              </span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                Active
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              All premium features unlocked
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-lg bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span>Daily Messages</span>
            <span className="font-medium">
              <Infinity className="inline h-4 w-4 text-brand-purple" />
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Avatar Regenerations</span>
            <span className="font-medium">
              <Infinity className="inline h-4 w-4 text-brand-purple" />
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Companions</span>
            <span className="font-medium">Up to 5</span>
          </div>
          <hr className="border-border/30" />
          <div className="flex items-center justify-between text-sm">
            <span>Status</span>
            <span className="font-medium text-brand-purple">Active VIP</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Your VIP Benefits:
          </p>
          <ul className="space-y-1.5">
            {[
              "Unlimited messages every day",
              "Unlimited avatar regenerations",
              "Up to 5 AI companions",
              "Priority AI response generation",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-purple" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
