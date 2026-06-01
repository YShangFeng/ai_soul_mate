import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_DOMAIN = "aisoulmate.chat";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const url = request.nextUrl;

  // Only redirect vercel.app domains, never the canonical domain
  if (
    host !== CANONICAL_DOMAIN &&
    !host.startsWith("localhost") &&
    host.includes("vercel.app")
  ) {
    return NextResponse.redirect(
      `https://${CANONICAL_DOMAIN}${url.pathname}${url.search}`,
      301,
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
