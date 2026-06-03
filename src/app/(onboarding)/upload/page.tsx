"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PhotoUploader } from "@/components/onboarding/photo-uploader";
import { ImageCropper } from "@/components/onboarding/image-cropper";
import { PreferenceSelector } from "@/components/onboarding/preference-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CompanionGender, CompanionStyle } from "@/types/companion";
import { toast } from "@/components/ui/toast";
import { useCompanions } from "@/hooks/use-companions";
import { useSubscription } from "@/hooks/use-subscription";
import { Loader2, AlertTriangle, Crown } from "lucide-react";

type UploadStep = "upload" | "crop" | "preferences";

/** Companion limits per plan */
const COMPANION_LIMITS: Record<string, number> = {
  free: 1,
  moon: 5,
  starlight: 10,
};

/**
 * Upload — Step 2 of onboarding.
 * 1. Upload photo
 * 2. Crop it
 * 3. Choose gender + style preferences
 * 4. Trigger generation
 */
export default function UploadPage() {
  const router = useRouter();
  const { companions, isLoading: isCompanionsLoading } = useCompanions();
  const { plan, isLoading: isPlanLoading } = useSubscription();
  const [step, setStep] = useState<UploadStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [selectedGender, setSelectedGender] = useState<CompanionGender | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<CompanionStyle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = isCompanionsLoading || isPlanLoading;
  const maxCompanions = COMPANION_LIMITS[plan] ?? 1;
  const atLimit = companions.length >= maxCompanions;

  const handleFileSelected = useCallback((file: File) => {
    setSelectedFile(file);
    setStep("crop");
  }, []);

  const handleCropComplete = useCallback((blob: Blob) => {
    setCroppedBlob(blob);
    setStep("preferences");
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedGender || !selectedStyle || !croppedBlob) return;

    setIsSubmitting(true);

    try {
      // 1. Upload the cropped image
      const formData = new FormData();
      formData.append("file", croppedBlob, "avatar.jpg");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadJson = await uploadRes.json();

      if (!uploadRes.ok || uploadJson.error) {
        toast({ title: "Upload failed", description: uploadJson.error?.message ?? "Please try again.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const { url: imageUrl, path: imagePath } = uploadJson.data;

      // 2. Store generation params in sessionStorage for the generating page
      sessionStorage.setItem(
        "generationParams",
        JSON.stringify({
          imageUrl,
          imagePath,
          gender: selectedGender,
          style: selectedStyle,
          relationship: "close_friend", // default, will be overridden in personalization
        }),
      );

      router.push("/generating");
    } catch (err) {
      console.error("Upload error:", err);
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
      setIsSubmitting(false);
    }
  }, [croppedBlob, selectedGender, selectedStyle, router]);

  return (
    <>
      {/* Limit check — block Free users at 1 companion */}
      {!isLoading && atLimit && (
        <div className="mx-auto max-w-md space-y-4 pt-8 text-center">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 dark:border-amber-800/30 dark:bg-amber-950/20">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
            <h2 className="mt-4 text-xl font-semibold">Companion Limit Reached</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {plan === "free"
                ? `Free accounts can create 1 companion. You have ${companions.length}.`
                : `Your ${plan === "moon" ? "Moon" : "Starlight"} plan allows up to ${maxCompanions} companions. You have ${companions.length}.`}
            </p>
            {plan === "free" && (
              <Button asChild className="mt-6 gap-2 w-full" size="lg">
                <Link href="/pricing">
                  <Crown className="h-4 w-4" />
                  Upgrade to Create More
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
        </div>
      )}

      {/* Normal upload flow */}
      {!isLoading && !atLimit && (
    <Card className="border-border/40 bg-card/80 shadow-lg backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-center text-xl">
          {step === "upload" && "Upload Your Photo"}
          {step === "crop" && "Adjust Your Photo"}
          {step === "preferences" && "Choose Your Style"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === "upload" && (
          <PhotoUploader
            onFileSelected={handleFileSelected}
            selectedFile={selectedFile}
          />
        )}

        {step === "crop" && selectedFile && (
          <ImageCropper
            file={selectedFile}
            onCropComplete={handleCropComplete}
            onBack={() => {
              setSelectedFile(null);
              setStep("upload");
            }}
          />
        )}

        {step === "preferences" && (
          <PreferenceSelector
            selectedGender={selectedGender}
            selectedStyle={selectedStyle}
            onGenderChange={setSelectedGender}
            onStyleChange={setSelectedStyle}
            onSubmit={handleGenerate}
            isSubmitting={isSubmitting}
          />
        )}
      </CardContent>
    </Card>
      )}
    </>
  );
}
