"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ============================================
// Types
// ============================================

interface TypingIndicatorProps {
  companionName: string;
  avatarUrl?: string | null;
}

// ============================================
// Component
// ============================================

export function TypingIndicator({ companionName, avatarUrl }: TypingIndicatorProps) {
  const initials = companionName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-start gap-2 px-4 py-2">
      {/* Mini avatar */}
      <Avatar className="mt-1 h-7 w-7 shrink-0">
        <AvatarImage src={avatarUrl ?? undefined} alt={companionName} />
        <AvatarFallback className="bg-brand-purple/10 text-[10px] text-brand-purple">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Dots + label */}
      <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5">
        <div className="flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {companionName} is typing...
        </span>
      </div>
    </div>
  );
}
