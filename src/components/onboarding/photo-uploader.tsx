"use client";

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react";
import { Upload, X, ImageIcon, AlertTriangle } from "lucide-react";
import { validateImageFile } from "@/lib/utils/image";

// ============================================
// Types
// ============================================

interface PhotoUploaderProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
}

// ============================================
// Component
// ============================================

export function PhotoUploader({ onFileSelected, selectedFile }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Handle file validation and preview
  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);

      // Generate preview
      const url = URL.createObjectURL(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);

      onFileSelected(file);
    },
    [onFileSelected, previewUrl],
  );

  // Reset selection
  function handleRemove() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  // Drag & drop handlers
  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        // Dropzone
        <div
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors ${
            isDragging
              ? "border-brand-purple bg-brand-purple/5"
              : "border-white/20 hover:border-brand-purple/50 hover:bg-white/5"
          }`}
          role="button"
          tabIndex={0}
          aria-label="Upload a photo"
        >
          {isDragging ? (
            <>
              <Upload className="mb-4 h-10 w-10 text-brand-purple" />
              <p className="text-lg font-medium text-brand-purple">Drop your photo here</p>
            </>
          ) : (
            <>
              <ImageIcon className="mb-4 h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-medium">Upload a Photo of Yourself</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Drag & drop or click to browse
              </p>
              <p className="mt-2 text-xs text-muted-foreground/60">
                JPG, PNG, or WebP — up to 10MB
              </p>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
            aria-label="Select photo"
          />
        </div>
      ) : (
        // Preview
        <div className="space-y-4">
          <div className="relative mx-auto overflow-hidden rounded-2xl border border-border/40">
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-80 w-full object-contain"
              />
            )}
            <button
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-foreground/10 p-1.5 text-foreground backdrop-blur-sm transition hover:bg-foreground/20"
              aria-label="Remove photo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
