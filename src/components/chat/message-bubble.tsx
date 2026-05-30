"use client";

import { RefreshCw, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message } from "@/types/chat";

// ============================================
// Types
// ============================================

interface MessageBubbleProps {
  message: Message;
  companionName?: string;
  companionAvatarUrl?: string | null;
  onResend?: (content: string) => void;
}

// ============================================
// Component
// ============================================

export function MessageBubble({
  message,
  companionName = "",
  companionAvatarUrl,
  onResend,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isFailed = isUser && message.moderationFlagged && message.id.startsWith("optimistic-");
  const isFiltered = message.moderated || (message.moderationFlagged && !isUser);

  const time = formatTime(message.createdAt);
  const initials = companionName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Filtered/moderated message
  if (isFiltered) {
    return (
      <div className="flex justify-center py-1">
        <div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <AlertTriangle className="h-3 w-3" />
          Message filtered by safety system
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex gap-2 px-4 py-1.5 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Companion avatar (left side) */}
      {!isUser && (
        <Avatar className="mt-1 h-7 w-7 shrink-0">
          <AvatarImage src={companionAvatarUrl ?? undefined} alt={companionName} />
          <AvatarFallback className="bg-brand-purple/10 text-[10px] text-brand-purple">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Bubble */}
      <div className={`flex max-w-[75%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? isFailed
                ? "border border-destructive/50 bg-destructive/5 text-destructive"
                : "bg-brand-purple text-white"
              : "bg-muted text-foreground"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {/* Failed message controls */}
          {isFailed && onResend && (
            <button
              onClick={() => onResend(message.content)}
              className="mt-1 flex items-center gap-1 text-xs text-destructive hover:underline"
            >
              <RefreshCw className="h-3 w-3" />
              Resend
            </button>
          )}
        </div>

        {/* Timestamp */}
        <span className="mt-0.5 text-[10px] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity">
          {time}
        </span>
      </div>

      {/* Spacer for right-aligned messages */}
      {isUser && <div className="w-7 shrink-0" />}
    </div>
  );
}

// ============================================
// Helpers
// ============================================

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
