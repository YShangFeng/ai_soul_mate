"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCompanions } from "@/hooks/use-companions";
import { useChat } from "@/hooks/use-chat";
import { useQuota } from "@/hooks/use-quota";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { WelcomeMessage } from "@/components/chat/welcome-message";
import { QuotaIndicator } from "@/components/chat/quota-indicator";
import { CompanionSwitcher } from "@/components/chat/companion-switcher";
import type { Relationship } from "@/types/companion";
import { Loader2 } from "lucide-react";

/**
 * Chat Page — multi-companion chat with iMessage-style UI.
 * Companion selection via ?id=XXX URL param.
 */
export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
        </div>
      }
    >
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companions, isLoading: isCompanionsLoading } = useCompanions();
  const { used, limit, remaining, isPro, isLoading: isQuotaLoading } = useQuota();

  // Get active companion from URL param, fallback to first companion
  const activeId = searchParams.get("id") ?? companions[0]?.id ?? "";

  // Find the active companion object
  const companion = companions.find((c) => c.id === activeId) ?? null;

  // If companions loaded and active companion not found, redirect to first
  useEffect(() => {
    if (!isCompanionsLoading && companions.length > 0 && !companion) {
      router.replace(`/chat?id=${companions[0].id}`);
    }
  }, [isCompanionsLoading, companions, companion, router]);

  // If no companions at all, redirect to upload
  useEffect(() => {
    if (!isCompanionsLoading && companions.length === 0) {
      router.replace("/upload");
    }
  }, [isCompanionsLoading, companions, router]);

  // Loading state
  if (isCompanionsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  // No companion yet
  if (companions.length === 0) {
    return null; // Will redirect via useEffect
  }

  // If no active companion set yet, show loading
  if (!companion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <ChatInterface
      companions={companions}
      activeId={activeId}
      companionId={companion.id}
      companionName={companion.name}
      companionAvatarUrl={companion.avatarUrl}
      companionRelationship={companion.relationship}
      quota={{ used, limit, remaining, isPro, isLoading: isQuotaLoading }}
    />
  );
}

// ============================================
// Inner Chat Interface
// ============================================

interface ChatInterfaceProps {
  companions: ReturnType<typeof useCompanions>["companions"];
  activeId: string;
  companionId: string;
  companionName: string;
  companionAvatarUrl: string | null;
  companionRelationship: string;
  quota: {
    used: number;
    limit: number;
    remaining: number;
    isPro: boolean;
    isLoading: boolean;
  };
}

function ChatInterface({
  companions,
  activeId,
  companionId,
  companionName,
  companionAvatarUrl,
  companionRelationship,
  quota,
}: ChatInterfaceProps) {
  const {
    messages,
    isLoading: isChatLoading,
    isStreaming,
    streamingContent,
    sendMessage,
    loadMoreMessages,
    hasMore,
  } = useChat({ companionId });

  const isFirstConversation = messages.length === 0 && !isChatLoading;

  function handleResend(content: string) {
    sendMessage(content);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* ── Fixed top section ── */}
      {companions.length > 1 && (
        <CompanionSwitcher companions={companions} activeId={activeId} />
      )}

      <ChatHeader
        name={companionName}
        avatarUrl={companionAvatarUrl}
        relationship={companionRelationship as Relationship}
      />

      <div className="flex items-center justify-center border-b border-border/30 px-4 py-1.5">
        <QuotaIndicator {...quota} />
      </div>

      {/* ── Scrollable middle: messages ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isFirstConversation ? (
          <WelcomeMessage
            companionName={companionName}
            companionAvatarUrl={companionAvatarUrl}
            relationship={companionRelationship as Relationship}
            companionId={companionId}
            isFirstConversation={true}
          />
        ) : (
          <MessageList
            messages={messages}
            isLoading={isChatLoading}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            hasMore={hasMore}
            companionName={companionName}
            companionAvatarUrl={companionAvatarUrl}
            onLoadMore={loadMoreMessages}
            onResend={handleResend}
          />
        )}
      </div>

      {/* ── Fixed bottom: input ── */}
      <ChatInput
        onSend={sendMessage}
        disabled={isStreaming}
        isPro={quota.isPro}
        quotaRemaining={quota.remaining}
      />
    </div>
  );
}
