import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatCompletion } from "@/lib/ai/siliconflow";
import { getSystemPrompt } from "@/lib/ai/prompts";

/**
 * GET /api/greeting?companionId=xxx
 *
 * Returns the daily greeting for a companion.
 * Generates a new one if none exists for today.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to get greetings." } },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const companionId = searchParams.get("companionId");

  if (!companionId) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "companionId is required." } },
      { status: 400 },
    );
  }

  // Verify companion ownership
  const { data: companion } = await supabase
    .from("companions")
    .select("*")
    .eq("id", companionId)
    .eq("user_id", user.id)
    .single();

  if (!companion) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Companion not found." } },
      { status: 404 },
    );
  }

  const today = new Date().toISOString().split("T")[0];

  // Check if today's greeting already exists
  const { data: existing } = await supabase
    .from("daily_greetings")
    .select("greeting_text")
    .eq("companion_id", companionId)
    .eq("date", today)
    .single();

  if (existing?.greeting_text) {
    return NextResponse.json({
      data: {
        greeting: existing.greeting_text,
        cached: true,
      },
    });
  }

  // Generate a new greeting
  try {
    const systemPrompt = getSystemPrompt(
      companion.relationship as Parameters<typeof getSystemPrompt>[0],
      companion.name,
    );

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

    const greeting = await chatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `It's ${timeOfDay}. Generate a warm, short greeting (1-2 sentences) as your character. Start a conversation naturally. Do NOT use quotation marks around the entire greeting. Speak directly.`,
        },
      ],
      temperature: 0.9,
      maxTokens: 120,
      stream: false,
    });

    const greetingText =
      typeof greeting === "string" ? greeting.trim() : "Hello! It's good to see you. 💫";

    // Store for today
    await supabase.from("daily_greetings").insert({
      companion_id: companionId,
      greeting_text: greetingText,
      date: today,
    });

    return NextResponse.json({
      data: {
        greeting: greetingText,
        cached: false,
      },
    });
  } catch (err) {
    console.error("Greeting generation error:", err);
    return NextResponse.json({
      data: {
        greeting: "Hello! It's so good to see you today. ✨",
        cached: false,
        fallback: true,
      },
    });
  }
}
