import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/age-gate"];
const STATIC_PREFIXES = ["/_next", "/api", "/favicon.ico", "/public"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Quick pass for static assets
  if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: { domain?: string; path?: string; maxAge?: number; sameSite?: "strict" | "lax" | "none"; secure?: boolean } }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Not authenticated: only allow public pages
  if (!user) {
    if (!PUBLIC_PATHS.includes(pathname)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const hasCompletedAgeGate = user.user_metadata?.age_verified === true;

  // Authenticated but not age-gated → must complete age gate first
  if (!hasCompletedAgeGate && pathname !== "/age-gate") {
    return NextResponse.redirect(new URL("/age-gate", request.url));
  }

  // Authenticated + onboarded: visiting root or auth pages → straight to chat
  if (hasCompletedAgeGate && ["/", "/login", "/signup", "/age-gate"].includes(pathname)) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
