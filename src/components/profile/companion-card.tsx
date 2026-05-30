"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RELATIONSHIP_LABELS, type Relationship } from "@/types/companion";

// ============================================
// Types
// ============================================

interface CompanionCardProps {
  name: string;
  avatarUrl: string | null;
  relationship: Relationship;
  daysTogether: number;
}

// ============================================
// Component
// ============================================

const RELATIONSHIP_EMOJI: Record<Relationship, string> = {
  romantic_partner: "💕",
  close_friend: "🤝",
  life_mentor: "🎓",
  fictional_character: "✨",
};

export function CompanionCard({
  name,
  avatarUrl,
  relationship,
  daysTogether,
}: CompanionCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const emoji = RELATIONSHIP_EMOJI[relationship] ?? "💬";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/60 p-8 backdrop-blur-sm">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/5 via-transparent to-brand-rose/5" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Avatar with glow */}
        <div className="relative mb-6">
          <div className="absolute inset-0 -m-2 rounded-full bg-gradient-to-br from-brand-purple/40 via-brand-rose/30 to-brand-purple/40 blur-xl" />
          <Avatar className="relative h-32 w-32 border-4 border-background shadow-2xl shadow-brand-purple/20">
            <AvatarImage src={avatarUrl ?? undefined} alt={name} />
            <AvatarFallback className="bg-brand-purple/10 text-3xl text-brand-purple">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name */}
        <h2 className="mb-1 text-2xl font-bold">{name}</h2>

        {/* Relationship badge */}
        <Badge variant="secondary" className="mb-4 gap-1 text-sm font-normal">
          {emoji} {RELATIONSHIP_LABELS[relationship]}
        </Badge>

        {/* Days together */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="text-brand-purple font-semibold">{daysTogether}</span>
          days together
        </div>
      </div>
    </div>
  );
}
