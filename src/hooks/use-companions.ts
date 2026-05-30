"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { mapCompanionRow, type Companion } from "@/types/companion";

interface UseCompanionsResult {
  companions: Companion[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Load ALL companions for the current user.
 * Used by the chat page for multi-companion switching.
 */
export function useCompanions(): UseCompanionsResult {
  const { supabase, user } = useSupabase();
  const [companions, setCompanions] = useState<Companion[]>([]);
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
        .order("created_at", { ascending: true });

      if (dbError) throw dbError;

      setCompanions((data ?? []).map(mapCompanionRow));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load companions");
      setCompanions([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { companions, isLoading, error, refetch };
}
