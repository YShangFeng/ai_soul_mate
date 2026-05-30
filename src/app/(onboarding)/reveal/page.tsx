"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AvatarReveal } from "@/components/onboarding/avatar-reveal";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

interface GenerationResult {
  imageUrl: string;
  seed: number;
  prompt: string;
}

interface GenerationParams {
  gender: string;
  style: string;
  relationship: string;
}

/**
 * Reveal — Step 4 of onboarding.
 * Shows the generated avatar with a blur-to-clear reveal animation.
 * Users can regenerate or continue to personalization.
 */
export default function RevealPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const resultStr = sessionStorage.getItem("generationResult");
    if (!resultStr) {
      router.push("/upload");
      return;
    }

    const result: GenerationResult = JSON.parse(resultStr);
    setImageUrl(result.imageUrl);
  }, [router]);

  async function handleRegenerate() {
    setIsRegenerating(true);

    const paramsStr = sessionStorage.getItem("generationParams");
    if (!paramsStr) {
      toast({ title: "Cannot regenerate", description: "Missing generation parameters.", variant: "destructive" });
      setIsRegenerating(false);
      return;
    }

    const params: GenerationParams = JSON.parse(paramsStr);

    try {
      const res = await fetch("/api/avatar/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: params.gender,
          style: params.style,
          relationship: params.relationship,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        toast({
          title: "Regeneration failed",
          description: json.error?.message ?? "Please try again.",
          variant: "destructive",
        });
        setIsRegenerating(false);
        return;
      }

      const newUrl = json.data.imageUrl;
      setImageUrl(newUrl);

      // Update stored result
      sessionStorage.setItem(
        "generationResult",
        JSON.stringify({
          imageUrl: newUrl,
          seed: json.data.seed,
          prompt: json.data.prompt,
        }),
      );

      toast({ title: "Regenerated!", description: "Here's your new Soul Mate." });
    } catch (err) {
      console.error("Regenerate error:", err);
      toast({ title: "Network error", description: "Please check your connection.", variant: "destructive" });
    } finally {
      setIsRegenerating(false);
    }
  }

  function handleContinue() {
    router.push("/personalize");
  }

  if (!imageUrl) {
    return (
      <Card className="border-border/40 bg-card/80 shadow-lg backdrop-blur-md">
        <CardContent className="flex h-64 items-center justify-center pt-8">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-card/80 shadow-lg backdrop-blur-md">
      <CardContent className="pt-8">
        <AvatarReveal
          imageUrl={imageUrl}
          onRegenerate={handleRegenerate}
          onContinue={handleContinue}
          isRegenerating={isRegenerating}
          canRegenerate={true}
        />
      </CardContent>
    </Card>
  );
}
