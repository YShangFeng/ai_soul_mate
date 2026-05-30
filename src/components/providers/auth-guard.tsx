"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  /** If true, redirects unauthenticated users to /login */
  requireAuth?: boolean;
  /** Pages that don't require authentication (pass through) */
  publicPaths?: string[];
}

/**
 * Client-side authentication guard.
 *
 * - While loading: shows a skeleton/spinner
 * - Authenticated: renders children
 * - Not authenticated + requireAuth: redirects to /login
 * - Public path: renders children regardless
 */
export function AuthGuard({
  children,
  requireAuth = false,
  publicPaths = ["/", "/login", "/signup", "/age-gate"],
}: AuthGuardProps) {
  const { user, isLoading } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();

  // Allow public paths through
  const isPublicPath = publicPaths.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(p)),
  );

  if (isPublicPath) {
    return <>{children}</>;
  }

  // Show loading skeleton while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!user && requireAuth) {
    const loginUrl = new URL("/login", window.location.origin);
    loginUrl.searchParams.set("redirect", pathname);
    router.replace(loginUrl.toString());
    return null;
  }

  // Authenticated — render children
  return <>{children}</>;
}
