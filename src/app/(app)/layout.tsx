"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompanion } from "@/hooks/use-companion";
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { companion, isLoading } = useCompanion();

  useEffect(() => {
    if (!isLoading && !companion) {
      router.replace("/age-gate");
    }
  }, [isLoading, companion, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (!companion) return null;

  return <>{children}</>;
}
