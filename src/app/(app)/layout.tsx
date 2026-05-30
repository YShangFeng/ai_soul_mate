"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useCompanion } from "@/hooks/use-companion";
import { Loader2 } from "lucide-react";

// ============================================
// App Layout (authenticated + onboarded users)
// ============================================

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { companion, isLoading } = useCompanion();

  useEffect(() => {
    if (!isLoading && !companion) {
      router.replace("/age-gate");
    }
  }, [isLoading, companion, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  // No companion — redirecting
  if (!companion) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Main content */}
      <main className="flex-1 pb-16 pt-14">{children}</main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
