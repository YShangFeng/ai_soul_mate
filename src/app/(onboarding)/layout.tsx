import type { Metadata } from "next";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { OnboardingProgress } from "@/components/layout/onboarding-progress";

export const metadata: Metadata = {
  title: "Onboarding - SoulMate.ai",
  description: "Set up your AI companion.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient opacity-70" />

      <div className="relative z-10 flex flex-1 flex-col">
        {/* Top nav */}
        <header className="flex items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Heart className="h-5 w-5 fill-brand-rose text-brand-rose" />
            <span>
              SoulMate<span className="text-brand-purple">.ai</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Exit Setup
          </Link>
        </header>

        {/* Step progress bar */}
        <OnboardingProgress />

        {/* Page content */}
        <main className="flex flex-1 items-start justify-center px-4 pb-12 pt-4">
          <div className="w-full max-w-lg">{children}</div>
        </main>
      </div>
    </div>
  );
}
