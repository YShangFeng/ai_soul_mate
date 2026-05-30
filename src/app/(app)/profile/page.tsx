"use client";

import { useMemo } from "react";
import { useCompanions } from "@/hooks/use-companions";
import { CompanionCard } from "@/components/profile/companion-card";
import { DaysCounter } from "@/components/profile/days-counter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Companion } from "@/types/companion";

/**
 * Profile Page — 纯粹展示伴侣信息，只读不可编辑
 */
export default function ProfilePage() {
  const { companions, isLoading } = useCompanions();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (companions.length === 0) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pb-24 pt-20">
      {companions.map((companion) => (
        <CompanionProfileCard key={companion.id} companion={companion} />
      ))}
    </div>
  );
}

function CompanionProfileCard({ companion }: { companion: Companion }) {
  const daysTogether = useMemo(() => {
    if (!companion.createdAt) return 0;
    const created = new Date(companion.createdAt);
    const now = new Date();
    return Math.max(1, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
  }, [companion.createdAt]);

  return (
    <Card className="border-border/40 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Your Companion
        </CardTitle>
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
  );
}
