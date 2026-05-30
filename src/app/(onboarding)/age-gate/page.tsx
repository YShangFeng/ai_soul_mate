"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AgeGateDialog, type AgeVerificationResult } from "@/components/onboarding/age-gate-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/components/providers/supabase-provider";

/**
 * Age Gate — Step 1 of onboarding.
 * Verifies user age before allowing access to the rest of the flow.
 */
export default function AgeGatePage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  async function handleVerify(result: AgeVerificationResult) {
    if (!user) return;

    setIsVerifying(true);

    try {
      // Calculate birth date from year (use Jan 1 of that year)
      const birthDate = `${result.birthYear}-01-01`;

      // Update profile with age verification
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

      // Store age group for the rest of the flow
      sessionStorage.setItem("ageGroup", result.ageGroup);

      // Navigate to upload step
      router.push("/upload");
    } catch (err) {
      console.error("Age verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 p-8 shadow-lg backdrop-blur-md">
      <AgeGateDialog onVerify={handleVerify} />
    </div>
  );
}
