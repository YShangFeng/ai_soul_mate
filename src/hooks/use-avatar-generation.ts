"use client";

import { useState, useCallback } from "react";

// ============================================
// Types
// ============================================

interface UseAvatarGenerationReturn {
  isGenerating: boolean;
  imageUrl: string | null;
  error: string | null;
  generate: (params: { gender: string; style: string; relationship?: string }) => Promise<string | null>;
  regenerate: (params: { gender: string; style: string; relationship?: string }) => Promise<string | null>;
}

// ============================================
// Hook
// ============================================

/**
 * Generic avatar generation hook.
 * Used by onboarding flow and settings page for regeneration.
 */
export function useAvatarGeneration(): UseAvatarGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (params: { gender: string; style: string; relationship?: string }): Promise<string | null> => {
      setIsGenerating(true);
      setError(null);

      try {
        const res = await fetch("/api/avatar/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gender: params.gender,
            style: params.style,
            relationship: params.relationship ?? "close_friend",
          }),
        });

        const json = await res.json();

        if (!res.ok || json.error) {
          setError(json.error?.message ?? "Generation failed");
          setIsGenerating(false);
          return null;
        }

        const url = json.data?.imageUrl;
        if (url) setImageUrl(url);
        return url;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  const regenerate = useCallback(
    async (params: { gender: string; style: string; relationship?: string }): Promise<string | null> => {
      setIsGenerating(true);
      setError(null);

      try {
        const res = await fetch("/api/avatar/regenerate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gender: params.gender,
            style: params.style,
            relationship: params.relationship ?? "close_friend",
          }),
        });

        const json = await res.json();

        if (!res.ok || json.error) {
          setError(json.error?.message ?? "Regeneration failed");
          setIsGenerating(false);
          return null;
        }

        const url = json.data?.imageUrl;
        if (url) setImageUrl(url);
        return url;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  return { isGenerating, imageUrl, error, generate, regenerate };
}
