"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { User, Session, SupabaseClient } from "@supabase/supabase-js";

// ============================================
// Supabase Context
// ============================================

interface SupabaseContextValue {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

export function useSupabase(): SupabaseContextValue {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a <SupabaseProvider>");
  }
  return context;
}

interface SupabaseProviderProps {
  children: ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ),
  );
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Memoize context value to prevent infinite re-renders in consumer hooks
  const value = useMemo(
    () => ({ supabase, user, session, isLoading }),
    [supabase, user, session, isLoading],
  );

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}
