"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { mapCompanionRow, type Companion } from "@/types/companion";

// ============================================
// Hook
// ============================================

interface UseCompanionResult {
  companion: Companion | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Load the current user's primary companion.
 * Returns null if no companion exists yet.
 */
export function useCompanion(): UseCompanionResult {
  const { supabase, user } = useSupabase();
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from("companions")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (dbError) {
        // No companion found = not an error, just no data
        if (dbError.code === "PGRST116") {
          setCompanion(null);
        } else {
          throw dbError;
        }
      } else if (data) {
        setCompanion(mapCompanionRow(data));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load companion");
      setCompanion(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { companion, isLoading, error, refetch };
}
