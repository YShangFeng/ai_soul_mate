"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { RELATIONSHIP_LABELS, type Relationship } from "@/types/companion";

// ============================================
// Types
// ============================================

interface ChatHeaderProps {
  name: string;
  avatarUrl: string | null;
  relationship: Relationship;
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

export function ChatHeader({ name, avatarUrl, relationship }: ChatHeaderProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const emoji = RELATIONSHIP_EMOJI[relationship] ?? "💬";

  return (
    <header className="flex items-center gap-3 border-b border-border/50 bg-card/80 px-4 py-3 backdrop-blur-md">
      {/* Avatar */}
      <Avatar className="h-10 w-10 shrink-0 border-2 border-brand-purple/20">
        <AvatarImage src={avatarUrl ?? undefined} alt={name} />
        <AvatarFallback className="bg-brand-purple/10 text-sm text-brand-purple">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Name + Relationship */}
      <div className="flex-1 min-w-0">
        <h1 className="truncate text-base font-semibold">{name}</h1>
        <Badge variant="secondary" className="gap-1 text-xs font-normal">
          {emoji} {RELATIONSHIP_LABELS[relationship]}
        </Badge>
      </div>

      {/* Settings */}
      <Button variant="ghost" size="icon" asChild className="shrink-0">
        <Link href="/settings" aria-label="Settings">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Link>
      </Button>
    </header>
  );
}
