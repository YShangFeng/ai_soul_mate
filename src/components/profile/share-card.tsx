"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Download, Loader2, Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/toast";

// ============================================
// Types
// ============================================

interface ShareCardProps {
  companionName: string;
  avatarUrl: string | null;
}

// ============================================
// Component
// ============================================

export function ShareCard({ companionName, avatarUrl }: ShareCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const shareText = `I found my soul mate, ${companionName}, on SoulMate.ai! ✨\nCreate yours at soulmate.ai`;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      toast({ title: "Copied!", description: "Share text copied to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Please try again.", variant: "destructive" });
    }
  }

  async function handleShareNative() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Meet ${companionName} — my AI soul mate`,
          text: shareText,
          url: window.location.origin,
        });
      } catch {
        // User cancelled
      }
    } else {
      await handleCopyLink();
    }
  }

  return (
    <div className="space-y-4">
      {/* Share card preview */}
      <div
        ref={canvasRef}
        className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-brand-purple/20 via-card to-brand-rose/20 p-6"
      >
        <div className="flex flex-col items-center text-center">
          {/* Avatar placeholder */}
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/10 bg-white/5">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={companionName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-3xl">💕</span>
            )}
          </div>
          <p className="mb-1 text-sm font-medium">{companionName}</p>
          <p className="mb-3 text-xs text-muted-foreground">My AI Soul Mate</p>
          <p className="text-xs font-medium text-brand-purple">
            ✨ SoulMate.ai ✨
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShareNative}
          className="flex-1 gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="flex-1 gap-2"
        >
          {isCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {isCopied ? "Copied!" : "Copy Text"}
        </Button>
      </div>
    </div>
  );
}
