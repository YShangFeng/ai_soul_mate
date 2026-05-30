"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AgeGateDialog, type AgeVerificationResult } from "@/components/onboarding/age-gate-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Loader2 } from "lucide-react";

export default function AgeGatePage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // On mount, check if user already completed onboarding
  useEffect(() => {
    if (isAuthLoading || !user) return;

    async function checkExisting() {
      if (!user) return;
      try {
        // Check if age already verified in session
        const ageVerified = user.user_metadata?.age_verified === true;

        // Also check database for companion
        const { data: companions } = await supabase
          .from("companions")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        const hasCompanion = companions && companions.length > 0;

        if (ageVerified && hasCompanion) {
          // Fully onboarded — go to chat
          window.location.href = "/chat";
          return;
        }

        if (ageVerified) {
          // Age verified but no companion — go to upload
          router.push("/upload");
          return;
        }

        // Update metadata from DB if needed
        const { data: profile } = await supabase
          .from("profiles")
          .select("age_verified")
          .eq("id", user.id)
          .single();

        if (profile?.age_verified) {
          // DB says verified, but session doesn't — update session
          await supabase.auth.updateUser({ data: { age_verified: true } });

          if (hasCompanion) {
            window.location.href = "/chat";
          } else {
            router.push("/upload");
          }
          return;
        }
      } catch (err) {
        console.error("Check existing error:", err);
      } finally {
        setIsChecking(false);
      }
    }

    checkExisting();
  }, [isAuthLoading, user, supabase, router]);

  async function handleVerify(result: AgeVerificationResult) {
    if (!user) return;

    setIsVerifying(true);

    try {
      const birthDate = `${result.birthYear}-01-01`;

      const { error } = await supabase
        .from("profiles")
        .update({
          age_verified: true,
          birth_date: birthDate,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Age verification DB error:", error);
        return;
      }

      await supabase.auth.updateUser({
        data: { age_verified: true },
      });

      sessionStorage.setItem("ageGroup", result.ageGroup);

      router.push("/upload");
    } catch (err) {
      console.error("Age verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  }

  if (isAuthLoading || isChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 p-8 shadow-lg backdrop-blur-md">
      <AgeGateDialog onVerify={handleVerify} />
    </div>
  );
}
