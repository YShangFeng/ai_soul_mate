"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { RELATIONSHIP_LABELS, type Companion, type Relationship } from "@/types/companion";

// ============================================
// Types
// ============================================

interface CompanionSwitcherProps {
  companions: Companion[];
  activeId: string;
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

export function CompanionSwitcher({ companions, activeId }: CompanionSwitcherProps) {
  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className="flex items-center gap-2 border-b border-border/40 bg-muted/30 px-3 py-2">
      {/* Scrollable companion list */}
      <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-hide">
        {companions.map((c) => {
          const emoji = RELATIONSHIP_EMOJI[c.relationship as Relationship] ?? "💬";
          const isActive = c.id === activeId;

          return (
            <Link
              key={c.id}
              href={`/chat?id=${c.id}`}
              className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-all ${
                isActive
                  ? "bg-brand-purple text-white shadow-sm shadow-brand-purple/20"
                  : "bg-white/50 text-foreground hover:bg-white hover:shadow-sm dark:bg-white/5 dark:hover:bg-white/10"
              }`}
            >
              <Avatar className="h-6 w-6 border border-white/30">
                <AvatarImage src={c.avatarUrl ?? undefined} alt={c.name} />
                <AvatarFallback className="text-[10px] bg-brand-purple/10 text-brand-purple">
                  {getInitials(c.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-tight">
                <span className="font-medium">{c.name}</span>
                <span className="text-[10px] opacity-70">
                  {emoji} {RELATIONSHIP_LABELS[c.relationship as Relationship]}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Add new companion button */}
      <Link
        href="/upload"
        className="flex shrink-0 items-center justify-center h-8 w-8 rounded-full bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 transition-colors"
        title="Create new companion"
      >
        <Plus className="h-4 w-4" />
      </Link>
    </div>
  );
}
