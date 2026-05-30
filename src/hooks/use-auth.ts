"use client";

import { useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";

/**
 * Authentication hook providing all auth operations.
 *
 * @example
 * ```tsx
 * const { user, signIn, signUp, signOut, signInWithGoogle } = useAuth();
 * ```
 */
export function useAuth() {
  const { supabase, user, isLoading } = useSupabase();

  /**
   * Sign in with email and password.
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await supabase.auth.signInWithPassword({ email, password });
      return {
        data: result.data,
        error: result.error
          ? {
              message: result.error.message,
              status: result.error.status,
            }
          : null,
      };
    },
    [supabase],
  );

  /**
   * Sign up with email, password, and optional full name.
   * Full name is stored in user_metadata for the auto-create profile trigger.
   */
  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName ?? "" },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return {
        data: result.data,
        error: result.error
          ? {
              message: result.error.message,
              status: result.error.status,
            }
          : null,
      };
    },
    [supabase],
  );

  /**
   * Sign in with Google OAuth.
   * Redirects to Google, then back to /auth/callback.
   */
  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Google sign-in error:", error.message);
      throw error;
    }
  }, [supabase]);

  /**
   * Sign out the current user.
   */
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return {
      error: error
        ? {
            message: error.message,
            status: error.status,
          }
        : null,
    };
  }, [supabase]);

  /**
   * Get the current session (alternative to using the user from context).
   */
  const getSession = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    return {
      session: data.session,
      error: error
        ? {
            message: error.message,
            status: error.status,
          }
        : null,
    };
  }, [supabase]);

  return {
    /** Current authenticated user (null if not signed in) */
    user,
    /** Whether auth state is still loading */
    isLoading,
    /** Sign in with email + password */
    signIn,
    /** Sign up with email + password + optional full name */
    signUp,
    /** Sign in with Google OAuth */
    signInWithGoogle,
    /** Sign out */
    signOut,
    /** Get current session */
    getSession,
    /** Raw Supabase client (use sparingly) */
    supabase,
  };
}
