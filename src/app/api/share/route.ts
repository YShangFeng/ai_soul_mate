import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/share
 *
 * Generates a share card for the user's companion.
 * This is a server-side alternative to the client-side html2canvas approach.
 *
 * Body: { companionId: string }
 * Returns: { data: { shareText: string, companionName: string, imageUrl: string } }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to share." } },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const { companionId } = body as { companionId?: string };

  if (!companionId) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "companionId is required." } },
      { status: 400 },
    );
  }

  // Fetch companion
  const { data: companion } = await supabase
    .from("companions")
    .select("name, avatar_url")
    .eq("id", companionId)
    .eq("user_id", user.id)
    .single();

  if (!companion) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Companion not found." } },
      { status: 404 },
    );
  }

  const shareText = `I found my soul mate, ${companion.name}, on SoulMate.ai! ✨\n\nCreate yours at soulmate.ai`;

  return NextResponse.json({
    data: {
      shareText,
      companionName: companion.name,
      imageUrl: companion.avatar_url,
    },
  });
}
