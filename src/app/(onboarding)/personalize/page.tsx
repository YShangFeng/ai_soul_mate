"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NameRelationshipForm } from "@/components/onboarding/name-relationship-form";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import type { Relationship } from "@/types/companion";

interface GenerationResult {
  imageUrl: string;
}

interface GenerationParams {
  gender: string;
  style: string;
}

/**
 * Personalize — Step 5 of onboarding.
 * Name the companion and select the relationship type.
 * On submit → POST /api/companion → redirect /chat
 */
export default function PersonalizePage() {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [style, setStyle] = useState<string>("");
  const [ageGroup, setAgeGroup] = useState<"teen" | "adult">("adult");

  useEffect(() => {
    const resultStr = sessionStorage.getItem("generationResult");
    const paramsStr = sessionStorage.getItem("generationParams");
    const ageGroupStr = sessionStorage.getItem("ageGroup");

    if (!resultStr || !paramsStr) {
      router.push("/upload");
      return;
    }

    const result: GenerationResult = JSON.parse(resultStr);
    const params: GenerationParams = JSON.parse(paramsStr);

    setAvatarUrl(result.imageUrl);
    setGender(params.gender);
    setStyle(params.style);
    setAgeGroup((ageGroupStr === "teen" ? "teen" : "adult") as "teen" | "adult");
  }, [router]);

  async function handleSubmit(name: string, relationship: Relationship) {
    // Validate: teens can't select romantic partner
    if (ageGroup === "teen" && relationship === "romantic_partner") {
      toast({
        title: "Age restricted",
        description: "Romantic Partner mode is available at 18+.",
        variant: "destructive",
      });
      throw new Error("Age restricted");
    }

    const res = await fetch("/api/companion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        relationship,
        gender,
        style,
        avatarUrl,
      }),
    });

    const json = await res.json();

    if (!res.ok || json.error) {
      toast({
        title: "Creation failed",
        description: json.error?.message ?? "Please try again.",
        variant: "destructive",
      });
      throw new Error(json.error?.message ?? "Creation failed");
    }

    // Store companion ID for the chat page
    sessionStorage.setItem("activeCompanionId", json.data.id);

    // Clear onboarding data
    sessionStorage.removeItem("generationParams");
    sessionStorage.removeItem("generationResult");

    toast({
      title: "✨ Your Soul Mate is here!",
      description: `Say hi to ${name}!`,
    });

    router.push("/chat");
  }

  if (!avatarUrl) {
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
        <NameRelationshipForm
          avatarUrl={avatarUrl}
          ageGroup={ageGroup}
          onSubmit={handleSubmit}
        />
      </CardContent>
    </Card>
  );
}
