"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompanion } from "@/hooks/use-companion";
import { useChat } from "@/hooks/use-chat";
import { useQuota } from "@/hooks/use-quota";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { WelcomeMessage } from "@/components/chat/welcome-message";
import { QuotaIndicator } from "@/components/chat/quota-indicator";
import { Loader2 } from "lucide-react";

/**
 * Chat Page — the core conversation interface.
 * iMessage-style chat with AI companion.
 */
export default function ChatPage() {
  const router = useRouter();
  const { companion, isLoading: isCompanionLoading } = useCompanion();
  const { used, limit, remaining, isPro, isLoading: isQuotaLoading } = useQuota();

  // Redirect if no companion
  useEffect(() => {
    if (!isCompanionLoading && !companion) {
      router.replace("/age-gate");
    }
  }, [isCompanionLoading, companion, router]);

  // Loading state
  if (isCompanionLoading || !companion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  // Inner component that depends on companion
  return (
    <ChatInterface
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <ChatHeader
        name={companionName}
        avatarUrl={companionAvatarUrl}
        relationship={companionRelationship as Parameters<typeof ChatHeader>[0]["relationship"]}
      />

      {/* Quota bar */}
      <div className="flex items-center justify-center border-b border-border/30 px-4 py-1.5">
        <QuotaIndicator {...quota} />
      </div>

      {/* Messages or Welcome */}
      {isFirstConversation ? (
        <div className="flex-1 overflow-y-auto">
          <WelcomeMessage
            companionName={companionName}
            companionAvatarUrl={companionAvatarUrl}
            relationship={companionRelationship as Parameters<typeof WelcomeMessage>[0]["relationship"]}
            companionId={companionId}
            isFirstConversation={true}
          />
        </div>
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

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isStreaming}
        isPro={quota.isPro}
        quotaRemaining={quota.remaining}
      />
    </div>
  );
}
