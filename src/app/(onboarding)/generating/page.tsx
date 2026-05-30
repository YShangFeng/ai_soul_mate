"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { GenerationProgress } from "@/components/onboarding/generation-progress";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

interface GenerationParams {
  imageUrl: string;
  imagePath: string;
  gender: string;
  style: string;
  relationship: string;
}

/**
 * Generating — Step 3 of onboarding.
 * Calls /api/avatar/generate and waits for the result.
 * On success → redirects to /reveal
 */
export default function GeneratingPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const hasTriggered = useRef(false);

  const triggerGeneration = useCallback(async () => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    const paramsStr = sessionStorage.getItem("generationParams");
    if (!paramsStr) {
      setHasError(true);
      setErrorMessage("No generation parameters found. Please go back and try again.");
      setIsGenerating(false);
      return;
    }

    const params: GenerationParams = JSON.parse(paramsStr);

    try {
      const res = await fetch("/api/avatar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: params.imageUrl,
          imagePath: params.imagePath,
          gender: params.gender,
          style: params.style,
          relationship: params.relationship,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setHasError(true);
        setErrorMessage(json.error?.message ?? "Generation failed. Please try again.");
        setIsGenerating(false);
        return;
      }

      const { imageUrl, seed, prompt } = json.data;

      // Store result for the reveal page
      sessionStorage.setItem(
        "generationResult",
        JSON.stringify({ imageUrl, seed, prompt }),
      );

      setIsGenerating(false);
      setIsComplete(true);

      // Auto-redirect to reveal after a short delay
      setTimeout(() => {
        router.push("/reveal");
      }, 1500);
    } catch (err) {
      console.error("Generation error:", err);
      setHasError(true);
      setErrorMessage("Network error. Please check your connection and try again.");
      setIsGenerating(false);
    }
  }, [router]);

  useEffect(() => {
    triggerGeneration();
  }, [triggerGeneration]);

  function handleTryAgain() {
    hasTriggered.current = false;
    setIsGenerating(true);
    setIsComplete(false);
    setHasError(false);
    setErrorMessage(undefined);
    triggerGeneration();
  }

  return (
    <Card className="border-border/40 bg-card/80 shadow-lg backdrop-blur-md">
      <CardContent className="pt-8">
        <GenerationProgress
          isGenerating={isGenerating}
          isComplete={isComplete}
          hasError={hasError}
          errorMessage={errorMessage}
          onTryAgain={handleTryAgain}
        />
      </CardContent>
    </Card>
  );
}
