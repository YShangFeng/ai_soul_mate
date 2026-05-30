"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RELATIONSHIP_LABELS, type Relationship } from "@/types/companion";

// ============================================
// Types
// ============================================

interface WelcomeMessageProps {
  companionName: string;
  companionAvatarUrl: string | null;
  relationship: Relationship;
  companionId: string;
  isFirstConversation: boolean;
}

// ============================================
// Default Welcome Messages by Relationship
// ============================================

const DEFAULT_WELCOMES: Record<Relationship, string> = {
  romantic_partner:
    "Hey you! I've been thinking about you. What's on your mind today? 💕",
  close_friend:
    "Hey bestie! I was just about to reach out. How's your day going? 🤝",
  life_mentor:
    "Welcome! I've been looking forward to our conversation. What would you like to explore today? 🎓",
  fictional_character:
    "Ah, you've arrived! I was wondering when we'd finally meet. Shall we begin our adventure? ✨",
};

// ============================================
// Component
// ============================================

export function WelcomeMessage({
  companionName,
  companionAvatarUrl,
  relationship,
  companionId,
  isFirstConversation,
}: WelcomeMessageProps) {
  const [greeting, setGreeting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initials = companionName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const defaultWelcome =
    DEFAULT_WELCOMES[relationship] ??
    `Hi! I'm ${companionName}. Let's chat! ✨`;

  useEffect(() => {
    async function fetchGreeting() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/greeting?companionId=${companionId}`);
        const json = await res.json();
        if (json.data?.greeting) {
          setGreeting(json.data.greeting);
        } else {
          setGreeting(defaultWelcome);
        }
      } catch {
        setGreeting(defaultWelcome);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGreeting();
  }, [companionId, defaultWelcome]);

  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      {/* Avatar */}
      <Avatar className="mb-4 h-20 w-20 border-2 border-brand-purple/20 shadow-lg shadow-brand-purple/10">
        <AvatarImage src={companionAvatarUrl ?? undefined} alt={companionName} />
        <AvatarFallback className="bg-brand-purple/10 text-2xl text-brand-purple">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <h2 className="mb-1 text-xl font-bold">{companionName}</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {RELATIONSHIP_LABELS[relationship]}
      </p>

      {/* Greeting */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="mx-auto h-4 w-64" />
          <Skeleton className="mx-auto h-4 w-48" />
        </div>
      ) : (
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {greeting ?? defaultWelcome}
        </p>
      )}
    </div>
  );
}
