import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Admin Supabase client with service_role privileges.
 * Bypasses Row Level Security (RLS).
 *
 * USE SPARINGLY — only for:
 * - Stripe webhook handlers
 * - Background jobs
 * - Administrative operations
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in environment variables.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
