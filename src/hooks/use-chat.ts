"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { toast } from "@/components/ui/toast";
import type { Message } from "@/types/chat";

// ============================================
// Types
// ============================================

interface UseChatOptions {
  companionId: string;
  pageSize?: number;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  sendMessage: (content: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  hasMore: boolean;
  error: string | null;
}

// ============================================
// Hook
// ============================================

export function useChat({
  companionId,
  pageSize = 50,
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load initial messages
  useEffect(() => {
    if (!companionId) return;

    async function loadInitial() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/chat?companionId=${companionId}&limit=${pageSize}`,
        );

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error?.message ?? "Failed to load messages");
        }

        const json = await res.json();
        const msgs: Message[] = json.data ?? [];
        setMessages(msgs);
        setHasMore(msgs.length >= pageSize);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    }

    loadInitial();
  }, [companionId, pageSize]);

  // Load more (older) messages
  const loadMoreMessages = useCallback(async () => {
    if (messages.length === 0) return;

    const oldestId = messages[messages.length - 1]?.id;
    if (!oldestId) return;

    try {
      const res = await fetch(
        `/api/chat?companionId=${companionId}&limit=${pageSize}&before=${oldestId}`,
      );

      if (!res.ok) return;

      const json = await res.json();
      const olderMsgs: Message[] = json.data ?? [];

      if (olderMsgs.length > 0) {
        setMessages((prev) => [...prev, ...olderMsgs]);
      }
      setHasMore(olderMsgs.length >= pageSize);
    } catch {
      // Silently fail for pagination
    }
  }, [companionId, messages, pageSize]);

  // Send a message with SSE streaming
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);

      // Optimistic user message
      const optimisticId = `optimistic-${Date.now()}`;
      const userMessage: Message = {
        id: optimisticId,
        companionId,
        role: "user",
        content: content.trim(),
        moderated: false,
        moderationFlagged: false,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [userMessage, ...prev]);

      // Start streaming
      setIsStreaming(true);
      setStreamingContent("");

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companionId, message: content.trim() }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error?.message ?? "Failed to send message");
        }

        // Parse SSE stream
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let fullContent = "";
        let finalMessageId = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;

            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.content !== undefined) {
                fullContent += parsed.content;
                setStreamingContent(fullContent);
              }

              if (parsed.messageId) {
                finalMessageId = parsed.messageId;
              }

              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }

        // Add the complete AI message
        if (fullContent) {
          const companionMessage: Message = {
            id: finalMessageId || `msg-${Date.now()}`,
            companionId,
            role: "companion",
            content: fullContent,
            moderated: false,
            moderationFlagged: false,
            createdAt: new Date().toISOString(),
          };

          setMessages((prev) => {
            // Replace optimistic + add real response
            const filtered = prev.filter((m) => m.id !== optimisticId);
            return [companionMessage, userMessage, ...filtered];
          });
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        const errorMsg =
          err instanceof Error ? err.message : "Failed to send message";

        setError(errorMsg);

        // Mark the optimistic message as failed
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId
              ? { ...m, moderationFlagged: true } // Reuse flagged as error indicator
              : m,
          ),
        );

        toast({ title: "Message failed", description: errorMsg, variant: "destructive" });
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        abortControllerRef.current = null;
      }
    },
    [companionId, isStreaming],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    sendMessage,
    loadMoreMessages,
    hasMore,
    error,
  };
}
