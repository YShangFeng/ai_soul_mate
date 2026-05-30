// @ts-nocheck - https://github.com/supabase/ssr/issues - SSR 0.5.2 GenericSchema bug
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAvatar } from "@/lib/ai/siliconflow";
import { buildAvatarPrompt, NEGATIVE_PROMPT } from "@/lib/ai/prompts";
import type { CompanionGender, CompanionStyle, Relationship } from "@/types/companion";

const REGEN_LIMIT = 3;

/**
 * POST /api/avatar/regenerate
 *
 * Regenerate avatar image. Free users limited to 3 regenerations,
 * Pro users have unlimited regenerations.
 *
 * Body: { gender, style, relationship }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to regenerate." } },
      { status: 401 },
    );
  }

  // Parse body
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

  // Check limits
  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_generations_used")
    .eq("id", user.id)
    .single();

  const used = profile?.daily_generations_used ?? 0;

  // Check subscription for Pro
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .single();

  const isPro = subscription?.plan === "pro";

  if (!isPro && used >= REGEN_LIMIT) {
    return NextResponse.json(
      { error: { code: "LIMIT_REACHED", message: `Free users can regenerate up to ${REGEN_LIMIT} times. Upgrade to Pro for unlimited.` } },
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

    // Increment daily usage
    await supabase
      .from("profiles")
      .update({ daily_generations_used: used + 1 })
      .eq("id", user.id);

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
      { error: { code: "REGENERATION_FAILED", message: "Failed to regenerate. Please try again." } },
      { status: 500 },
    );
  }
}
