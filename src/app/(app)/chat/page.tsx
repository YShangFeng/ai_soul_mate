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
import { Button } from "@/components/ui/button";
import type { Relationship } from "@/types/companion";
import { Loader2, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

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

  const activeId = searchParams.get("id") ?? companions[0]?.id ?? "";
  const companion = companions.find((c) => c.id === activeId) ?? null;

  // If companions loaded and active companion not found, redirect to first
  useEffect(() => {
    if (!isCompanionsLoading && companions.length > 0 && !companion) {
      router.replace(`/chat?id=${companions[0].id}`);
    }
  }, [isCompanionsLoading, companions, companion, router]);

  if (isCompanionsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  // No companions yet — show guided empty state
  if (companions.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <Heart className="h-16 w-16 text-brand-rose/30" />
        <div>
          <h2 className="text-xl font-semibold">No companion yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a photo to create your first AI companion and start chatting.
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/upload">
            Create Your Companion
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

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
      <CompanionSwitcher companions={companions} activeId={activeId} />

      <ChatHeader
        name={companionName}
        avatarUrl={companionAvatarUrl}
        relationship={companionRelationship as Relationship}
        companionId={companionId}
      />

      <div className="flex items-center justify-center border-b border-border/30 px-4 py-1.5">
        <QuotaIndicator {...quota} />
      </div>

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

      <ChatInput
        onSend={sendMessage}
        disabled={isStreaming}
        isPro={quota.isPro}
        quotaRemaining={quota.remaining}
      />
    </div>
  );
}
