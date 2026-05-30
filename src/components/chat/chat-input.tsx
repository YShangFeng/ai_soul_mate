"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send, Lock } from "lucide-react";
import Link from "next/link";

// ============================================
// Types
// ============================================

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  isPro?: boolean;
  quotaRemaining?: number;
}

// ============================================
// Component
// ============================================

export function ChatInput({
  onSend,
  disabled = false,
  isPro = false,
  quotaRemaining = 0,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isQuotaExhausted = !isPro && quotaRemaining <= 0;
  const isInputDisabled = disabled || isQuotaExhausted;

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isInputDisabled) return;
    onSend(trimmed);
    setValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isInputDisabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  return (
    <div className="border-t border-border/50 bg-card/80 px-4 py-3 backdrop-blur-md">
      {/* Quota exhausted banner */}
      {isQuotaExhausted && (
        <div className="mb-2 flex items-center justify-center gap-2 rounded-lg bg-brand-purple/10 px-3 py-1.5 text-xs text-brand-purple">
          <Lock className="h-3 w-3" />
          Daily message limit reached.
          <Link
            href="/pricing"
            className="font-medium underline underline-offset-2 hover:text-brand-purple/80"
          >
            Upgrade to Pro for unlimited messages
          </Link>
        </div>
      )}

      {/* Quota indicator bar */}
      {!isPro && !isQuotaExhausted && (
        <div className="mb-2 text-center text-[10px] text-muted-foreground">
          {quotaRemaining} of 10 messages remaining today
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={
            isQuotaExhausted
              ? "Limit reached — upgrade to Pro"
              : "Type a message..."
          }
          rows={1}
          maxLength={2000}
          disabled={isInputDisabled}
          className="flex-1 resize-none rounded-xl border border-border/50 bg-muted/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-brand-purple/50 focus:outline-none focus:ring-1 focus:ring-brand-purple/30 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Message input"
        />

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={isInputDisabled || !value.trim()}
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
