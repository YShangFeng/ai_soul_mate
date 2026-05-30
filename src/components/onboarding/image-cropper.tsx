"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Crop, RotateCw, ZoomIn } from "lucide-react";
import { createCroppedImage } from "@/lib/utils/image";

// ============================================
// Types
// ============================================

interface ImageCropperProps {
  file: File;
  onCropComplete: (blob: Blob) => void;
  onBack: () => void;
}

// ============================================
// Component
// ============================================

export function ImageCropper({ file, onCropComplete, onBack }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(() => URL.createObjectURL(file));

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropCompleteInternal = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleCrop() {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const resultBlob = await createCroppedImage(
        file,
        { x: croppedAreaPixels.x / 100, y: croppedAreaPixels.y / 100 },
        zoom,
        { width: croppedAreaPixels.width, height: croppedAreaPixels.height },
      );
      onCropComplete(resultBlob);
    } catch (err) {
      console.error("Crop error:", err);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleRotate() {
    setRotation((prev) => (prev + 90) % 360);
  }

  return (
    <div className="space-y-4">
      {/* Cropper area */}
      <div className="relative h-[400px] w-full overflow-hidden rounded-xl bg-black/40">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteInternal}
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Zoom slider */}
        <div className="flex items-center gap-3">
          <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Slider
            value={[zoom]}
            onValueChange={([v]) => setZoom(v)}
            min={1}
            max={3}
            step={0.1}
            className="flex-1"
          />
          <span className="w-10 text-right text-xs text-muted-foreground">
            {zoom.toFixed(1)}×
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRotate} className="gap-1">
            <RotateCw className="h-4 w-4" />
            Rotate
          </Button>

          <div className="flex-1" />

          <Button variant="outline" size="sm" onClick={onBack} disabled={isProcessing}>
            Back
          </Button>

          <Button size="sm" onClick={handleCrop} disabled={isProcessing} className="gap-1">
            <Crop className="h-4 w-4" />
            {isProcessing ? "Processing..." : "Crop & Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
