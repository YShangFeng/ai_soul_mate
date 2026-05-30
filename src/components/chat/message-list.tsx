"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/chat/message-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { Loader2, ArrowUp } from "lucide-react";
import type { Message } from "@/types/chat";

// ============================================
// Types
// ============================================

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  hasMore: boolean;
  companionName: string;
  companionAvatarUrl: string | null;
  onLoadMore: () => void;
  onResend: (content: string) => void;
}

// ============================================
// Component
// ============================================

export function MessageList({
  messages,
  isLoading,
  isStreaming,
  streamingContent,
  hasMore,
  companionName,
  companionAvatarUrl,
  onLoadMore,
  onResend,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    // Scroll if new messages were added at the top (user sent) or streaming
    if (messages.length > prevLength || isStreaming) {
      requestAnimationFrame(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); });
    }
  }, [messages.length, isStreaming]);

  // Scroll to bottom on streaming content update
  useEffect(() => {
    if (isStreaming && streamingContent) {
      requestAnimationFrame(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); });
    }
  }, [isStreaming, streamingContent]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (messages.length === 0 && !isStreaming) {
    return null; // Parent handles empty state with welcome message
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      {/* Load earlier messages */}
      {hasMore && (
        <div className="flex justify-center py-3">
          <Button variant="ghost" size="sm" onClick={onLoadMore} className="gap-1 text-xs text-muted-foreground">
            <ArrowUp className="h-3 w-3" />
            Load earlier messages
          </Button>
        </div>
      )}

      {/* Message list (newest at top, oldest at bottom) */}
      <div className="flex flex-col-reverse py-2">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            companionName={companionName}
            companionAvatarUrl={companionAvatarUrl}
            onResend={msg.role === "user" ? onResend : undefined}
          />
        ))}

        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <div className="flex gap-2 px-4 py-1.5 justify-start">
            <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm leading-relaxed max-w-[75%]">
              <p className="whitespace-pre-wrap break-words">{streamingContent}</p>
            </div>
          </div>
        )}
      </div>

      {/* Typing indicator (before content arrives) */}
      {isStreaming && !streamingContent && (
        <TypingIndicator companionName={companionName} />
      )}

      <div ref={bottomRef} />
    </div>
  );
}
