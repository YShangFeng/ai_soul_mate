import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/avatar/status
 *
 * Query the generation status for a given prediction.
 * SiliconFlow's Stable Diffusion endpoint is synchronous, so this
 * endpoint serves as a compatibility shim and health check.
 *
 * Query: ?predictionId=xxx
 * Returns: { status, outputUrl? }
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to check generation status." } },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const predictionId = searchParams.get("predictionId");

  if (!predictionId) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Missing predictionId parameter." } },
      { status: 400 },
    );
  }

  // For synchronous generation, if we have a prediction ID it means
  // the generation has already completed. Return succeeded.
  // In the future, if SiliconFlow adds async image generation,
  // this would poll their status endpoint.
  return NextResponse.json({
    data: {
      status: "succeeded" as const,
      predictionId,
    },
  });
}
