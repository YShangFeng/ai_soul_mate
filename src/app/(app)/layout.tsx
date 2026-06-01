"use client";

import { Loader2 } from "lucide-react";
import { useCompanion } from "@/hooks/use-companion";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { companion, isLoading } = useCompanion();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  // Allow access even without a companion — user can create one later
  return <>{children}</>;
}
