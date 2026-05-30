import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createAdminClient(): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  ) as unknown as SupabaseClient<Database>;
}
