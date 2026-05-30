// @ts-nocheck - https://github.com/supabase/ssr/issues - SSR 0.5.2 GenericSchema bug
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAvatar } from "@/lib/ai/siliconflow";
import { buildAvatarPrompt, NEGATIVE_PROMPT } from "@/lib/ai/prompts";
import type { CompanionGender, CompanionStyle, Relationship } from "@/types/companion";

/**
 * POST /api/avatar/regenerate
 * Regenerate avatar image. Unlimited (payment system not yet enabled).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to regenerate." } },
      { status: 401 },
    );
  }

  const body = await request.json();
  const { gender, style, relationship } = body as {
    gender: CompanionGender;
    style: CompanionStyle;
    relationship: Relationship;
  };

  if (!gender || !style || !relationship) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Missing required fields." } },
      { status: 400 },
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

    return NextResponse.json({
      data: {
        imageUrl: result.imageUrl,
        seed: result.seed,
        prompt,
      },
    });
  } catch (err) {
    console.error("Regenerate error:", err);
    return NextResponse.json(
      { error: { code: "REGENERATION_FAILED", message: "Failed to regenerate." } },
      { status: 500 },
    );
  }
}
