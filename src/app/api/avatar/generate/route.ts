// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAvatar } from "@/lib/ai/siliconflow";
import { buildAvatarPrompt, NEGATIVE_PROMPT } from "@/lib/ai/prompts";
import { checkAvatarQuota, incrementAvatarUsage } from "@/lib/permissions";
import type { CompanionGender, CompanionStyle, Relationship } from "@/types/companion";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to generate avatars." } },
      { status: 401 },
    );
  }

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

  // Centralized quota check
  const quota = await checkAvatarQuota(user.id);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: { code: "LIMIT_REACHED", message: quota.reason } },
      { status: 429 },
    );
  }

  try {
    const prompt = buildAvatarPrompt(gender, style, relationship);
    const result = await generateAvatar({
      prompt,
      negativePrompt: NEGATIVE_PROMPT,
      width: 1024,
      height: 1024,
    });

    await incrementAvatarUsage(user.id);

    if (imagePath) {
      const adminClient = createAdminClient();
      await adminClient.storage.from("avatars").remove([imagePath]);
    }

    return NextResponse.json({
      data: { imageUrl: result.imageUrl, seed: result.seed, prompt },
    });
  } catch (err) {
    console.error("Avatar generation error:", err);
    return NextResponse.json(
      { error: { code: "GENERATION_FAILED", message: "Failed to generate avatar." } },
      { status: 500 },
    );
  }
}
