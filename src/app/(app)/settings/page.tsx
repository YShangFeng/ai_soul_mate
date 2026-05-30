"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompanion } from "@/hooks/use-companion";
import { RelationshipSettings } from "@/components/settings/relationship-settings";
import { SubscriptionPanel } from "@/components/settings/subscription-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, CreditCard } from "lucide-react";

/**
 * Settings Page — companion management + subscription.
 */
export default function SettingsPage() {
  const router = useRouter();
  const { companion, isLoading, refetch } = useCompanion();

  // Redirect if no companion
  useEffect(() => {
    if (!isLoading && !companion) {
      router.replace("/age-gate");
    }
  }, [isLoading, companion, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (!companion) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pb-24 pt-20">
      {/* Relationship Settings */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-brand-purple" />
            Companion Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RelationshipSettings
            companionId={companion.id}
            currentName={companion.name}
            currentRelationship={companion.relationship}
            onUpdate={refetch}
          />
        </CardContent>
      </Card>

      {/* Subscription */}
      <div id="subscription">
        <SubscriptionPanel />
      </div>
    </div>
  );
}
