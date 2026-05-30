import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/", "/login", "/signup"];
const STATIC_PREFIXES = ["/_next", "/api", "/favicon.ico", "/public"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  if (!user) {
    if (!PUBLIC_PATHS.includes(pathname) && pathname !== "/age-gate") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Check age_verified: token first, then DB fallback
  let ageVerified = user.user_metadata?.age_verified === true;

  if (!ageVerified) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("age_verified")
        .eq("id", user.id)
        .single();
      ageVerified = profile?.age_verified === true;
    } catch {
      // DB check failed, rely on token value
    }
  }

  // Onboarded users: redirect public/auth pages to chat
  if (ageVerified && [...PUBLIC_PATHS, "/age-gate"].includes(pathname)) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // New users (not verified): only allow /age-gate, everything else redirects there
  if (!ageVerified && pathname !== "/age-gate") {
    return NextResponse.redirect(new URL("/age-gate", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
