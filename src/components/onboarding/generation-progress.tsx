"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

// ============================================
// Types
// ============================================

interface GenerationProgressProps {
  isGenerating: boolean;
  isComplete: boolean;
  hasError: boolean;
  errorMessage?: string;
  onTryAgain: () => void;
}

// ============================================
// Copy Rotation
// ============================================

const COPY_STEPS = [
  { text: "Analyzing your features...", progress: 20 },
  { text: "Understanding your style preferences...", progress: 35 },
  { text: "Crafting your soul mate's appearance...", progress: 55 },
  { text: "Adding personality and warmth...", progress: 75 },
  { text: "Almost there — final touches...", progress: 90 },
];

const COPY_INTERVAL_MS = 3_000;

// ============================================
// Component
// ============================================

export function GenerationProgress({
  isGenerating,
  isComplete,
  hasError,
  errorMessage,
  onTryAgain,
}: GenerationProgressProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Animate copy rotation and progress during generation
  useEffect(() => {
    if (!isGenerating) {
      if (isComplete) {
        setProgress(100);
        setStepIndex(COPY_STEPS.length - 1);
      }
      return;
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= COPY_STEPS.length) return prev; // stay on last
        return next;
      });
    }, COPY_INTERVAL_MS);

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const target = COPY_STEPS[stepIndex]?.progress ?? 90;
        const diff = target - prev;
        if (Math.abs(diff) < 1) return target;
        return prev + diff * 0.3;
      });
    }, 200);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isGenerating, isComplete, stepIndex]);

  return (
    <div className="flex flex-col items-center space-y-8 text-center">
      {/* Animation / Icon */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Pulsing circle */}
        <div className="absolute inset-0 animate-ping rounded-full bg-brand-purple/20" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-brand-purple/30" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-purple/40 to-brand-rose/40 backdrop-blur-sm">
          <Sparkles className="h-10 w-10 text-white animate-pulse" />
        </div>
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">
          {isComplete
            ? "Your Soul Mate is Ready!"
            : hasError
              ? "Generation Failed"
              : "Creating Your Soul Mate"}
        </h2>
        <p
          className="text-sm text-muted-foreground min-h-[20px]"
          aria-live="polite"
        >
          {isComplete
            ? "Let's see who you've been matched with..."
            : hasError
              ? errorMessage ?? "Something went wrong. Please try again."
              : COPY_STEPS[stepIndex]?.text ?? COPY_STEPS[0].text}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Error retry */}
      {hasError && (
        <button
          onClick={onTryAgain}
          className="rounded-full bg-brand-purple px-6 py-2 text-sm font-medium text-white transition hover:bg-brand-purple/80"
        >
          Try Again
        </button>
      )}

      {/* Loading skeleton */}
      {isGenerating && !hasError && (
        <div className="w-full max-w-xs space-y-3">
          <div className="mx-auto h-48 w-48 animate-pulse rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand-rose/20" />
        </div>
      )}
    </div>
  );
}
