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

  // Hide root layout Header/Footer when inside app pages
  useEffect(() => {
    const header = document.querySelector("header[data-root]");
    const footer = document.querySelector("footer[data-root]");
    if (header) (header as HTMLElement).style.display = "none";
    if (footer) (footer as HTMLElement).style.display = "none";
    return () => {
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

  return <>{children}</>;
}
