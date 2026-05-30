"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCompanions } from "@/hooks/use-companions";
import { CompanionCard } from "@/components/profile/companion-card";
import { DaysCounter } from "@/components/profile/days-counter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import type { Relationship } from "@/types/companion";

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    }>
      <ProfilePageInner />
    </Suspense>
  );
}

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companions, isLoading } = useCompanions();

  const activeId = searchParams.get("id") ?? companions[0]?.id ?? "";
  const companion = companions.find((c) => c.id === activeId);

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
      <CompanionProfileCard companion={companion} />
    </div>
  );
}

function CompanionProfileCard({ companion }: { companion: { id: string; name: string; avatarUrl: string | null; relationship: string; createdAt: string } }) {
  const router = useRouter();
  const daysTogether = useMemo(() => {
    if (!companion.createdAt) return 0;
    const created = new Date(companion.createdAt);
    const now = new Date();
    return Math.max(1, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
  }, [companion.createdAt]);

  return (
    <Card className="border-border/40 overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Your Companion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CompanionCard
          name={companion.name}
          avatarUrl={companion.avatarUrl}
          relationship={companion.relationship as Relationship}
          daysTogether={daysTogether}
        />
        <DaysCounter days={daysTogether} />
      </CardContent>
    </Card>
  );
}
