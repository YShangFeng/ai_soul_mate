import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAvatar } from "@/lib/ai/siliconflow";
import { buildAvatarPrompt, NEGATIVE_PROMPT } from "@/lib/ai/prompts";
import type { CompanionGender, CompanionStyle, Relationship } from "@/types/companion";

// ============================================
// POST /api/avatar/generate
// ============================================

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to generate avatars." } },
      { status: 401 },
    );
  }

  // Parse body
  const body = await request.json();
  const { imageUrl, imagePath, gender, style, relationship } = body as {
    imageUrl?: string;
    imagePath?: string;
    gender: CompanionGender;
    style: CompanionStyle;
    relationship: Relationship;
  };

  if (!gender || !style || !relationship) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Missing required fields: gender, style, relationship." } },
      { status: 400 },
    );
  }

  // Check user's regeneration limits
  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_generations_used")
    .eq("id", user.id)
    .single();

  // Free users: 3 generations per day
  const used = profile?.daily_generations_used ?? 0;
  if (used >= 3) {
    return NextResponse.json(
      { error: { code: "LIMIT_REACHED", message: "Daily generation limit reached (3/day). Upgrade to Pro for unlimited." } },
      { status: 429 },
    );
  }

  try {
    // Build the prompt
    const prompt = buildAvatarPrompt(gender, style, relationship);

    // Generate the avatar
    const result = await generateAvatar({
      prompt,
      negativePrompt: NEGATIVE_PROMPT,
      width: 1024,
      height: 1024,
    });

    // Increment daily usage
    await supabase
      .from("profiles")
      .update({ daily_generations_used: used + 1 })
      .eq("id", user.id);

    // Clean up the uploaded photo from storage
    if (imagePath) {
      const adminClient = createAdminClient();
      await adminClient.storage.from("avatars").remove([imagePath]);
    }

    return NextResponse.json({
      data: {
        imageUrl: result.imageUrl,
        seed: result.seed,
        prompt,
      },
    });
  } catch (err) {
    console.error("Avatar generation error:", err);
    return NextResponse.json(
      { error: { code: "GENERATION_FAILED", message: "Failed to generate avatar. Please try again." } },
      { status: 500 },
    );
  }
}
