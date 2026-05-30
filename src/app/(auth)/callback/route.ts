import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback handler for Supabase Auth.
 * Exchanges the auth code for a session and redirects to /age-gate.
 *
 * Route: GET /auth/callback?code=<code>
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/age-gate";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=No authorization code received`);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth callback error:", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Redirect to the intended destination (default: age-gate)
  return NextResponse.redirect(`${origin}${next}`);
}
