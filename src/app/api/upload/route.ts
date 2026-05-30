// @ts-nocheck - https://github.com/supabase/ssr/issues - SSR 0.5.2 GenericSchema bug
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET_NAME = "avatars";
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * POST /api/upload
 *
 * Upload a user photo to Supabase Storage.
 * Files are stored in the "avatars" bucket with a 1-hour auto-expiry.
 *
 * Body: FormData { file: File }
 * Returns: { url: string, path: string }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to upload photos." } },
      { status: 401 },
    );
  }

  // Parse FormData
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "No file provided." } },
      { status: 400 },
    );
  }

  // Validate
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: { code: "INVALID_TYPE", message: "Only JPG, PNG, and WebP are supported." } },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: { code: "FILE_TOO_LARGE", message: "File must be under 10MB." } },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: { code: "EMPTY_FILE", message: "File is empty." } },
      { status: 400 },
    );
  }

  // Generate a unique path: {userId}/{timestamp}.jpg
  const timestamp = Date.now();
  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `${user.id}/${timestamp}.${ext}`;

  // Use admin client to bypass RLS for storage operations
  const adminClient = createAdminClient();

  const { data, error } = await adminClient.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: { code: "UPLOAD_FAILED", message: error.message } },
      { status: 500 },
    );
  }

  // Get the public URL
  const {
    data: { publicUrl },
  } = adminClient.storage.from(BUCKET_NAME).getPublicUrl(path);

  return NextResponse.json({
    data: {
      url: publicUrl,
      path,
    },
  });
}
