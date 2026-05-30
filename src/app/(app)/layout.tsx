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

  // Lock body scroll and hide root Header/Footer when entering app
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    // Hide root layout Header and Footer (they're siblings in the DOM)
    const header = document.querySelector("header[data-root]");
    const footer = document.querySelector("footer[data-root]");
    if (header) (header as HTMLElement).style.display = "none";
    if (footer) (footer as HTMLElement).style.display = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      if (header) (header as HTMLElement).style.display = "";
      if (footer) (footer as HTMLElement).style.display = "";
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (!companion) return null;

  return (
    <div className="flex h-screen flex-col bg-background">
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
