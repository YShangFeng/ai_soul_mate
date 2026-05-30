"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PhotoUploader } from "@/components/onboarding/photo-uploader";
import { ImageCropper } from "@/components/onboarding/image-cropper";
import { PreferenceSelector } from "@/components/onboarding/preference-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompanionGender, CompanionStyle } from "@/types/companion";
import { toast } from "@/components/ui/toast";

type UploadStep = "upload" | "crop" | "preferences";

/**
 * Upload — Step 2 of onboarding.
 * 1. Upload photo
 * 2. Crop it
 * 3. Choose gender + style preferences
 * 4. Trigger generation
 */
export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<UploadStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [selectedGender, setSelectedGender] = useState<CompanionGender | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<CompanionStyle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  );
}
