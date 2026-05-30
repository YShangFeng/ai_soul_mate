"use client";

import type { ReactNode } from "react";
import { SupabaseProvider } from "@/components/providers/supabase-provider";

// ============================================
// App Providers Wrapper
// ============================================

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Root provider tree for the application.
 * Wraps children with Supabase auth context.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <SupabaseProvider>{children}</SupabaseProvider>;
}
