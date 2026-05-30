// ============================================
// Image Compression & Processing Utilities
// ============================================

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
};

/**
 * Compress an image file using Canvas API.
 * Resizes to fit within maxWidth × maxHeight and applies JPEG compression.
 *
 * @param file - The input image file
 * @param options - Compression options
 * @returns Compressed Blob with the original MIME type
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<Blob> {
  const { maxWidth, maxHeight, quality } = { ...DEFAULT_OPTIONS, ...options };

  // Load image into an Image element
  const image = await loadImage(file);

  // Calculate new dimensions while maintaining aspect ratio
  const { width, height } = calculateDimensions(
    image.width,
    image.height,
    maxWidth,
    maxHeight,
  );

  // Draw onto canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2d context from canvas");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, width, height);

  // Export as Blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas toBlob returned null"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

/**
 * Crop an image from a data URL (canvas) to a Blob.
 *
 * @param dataUrl - The cropped image data URL from react-easy-crop
 * @returns Blob in JPEG format
 */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  // Ensure it's JPEG
  if (blob.type === "image/png" || blob.type.includes("png")) {
    return await compressBlobToJpeg(blob);
  }
  return blob;
}

/**
 * Create a cropped image from a source image and crop coordinates.
 *
 * @param file - Source image file
 * @param crop - { x, y } crop origin
 * @param zoom - Zoom level (1 = no zoom)
 * @param outputSize - { width, height } of the output
 * @returns Blob of the cropped image
 */
export async function createCroppedImage(
  file: File,
  crop: { x: number; y: number },
  zoom: number,
  outputSize: { width: number; height: number },
): Promise<Blob> {
  const image = await loadImage(file);

  const canvas = document.createElement("canvas");
  canvas.width = outputSize.width;
  canvas.height = outputSize.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2d context");

  const cropWidth = outputSize.width / zoom;
  const cropHeight = outputSize.height / zoom;
  const cropX = (image.width - cropWidth) * crop.x;
  const cropY = (image.height - cropHeight) * crop.y;

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    outputSize.width,
    outputSize.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas toBlob returned null"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.9,
    );
  });
}

// ============================================
// Validation
// ============================================

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return `Unsupported format: ${file.type}. Please use JPG, PNG, or WebP.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum is 10MB.`;
  }
  if (file.size === 0) {
    return "File is empty.";
  }
  return null;
}

// ============================================
// Helpers
// ============================================

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function calculateDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (srcWidth <= maxWidth && srcHeight <= maxHeight) {
    return { width: srcWidth, height: srcHeight };
  }

  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio),
  };
}

async function compressBlobToJpeg(blob: Blob): Promise<Blob> {
  const image = await loadImage(new File([blob], "temp.png"));
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2d context");
  ctx.drawImage(image, 0, 0);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) { reject(new Error("toBlob failed")); return; }
        resolve(b);
      },
      "image/jpeg",
      0.9,
    );
  });
}
