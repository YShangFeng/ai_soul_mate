"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Heart, Upload, Sparkles, ArrowDown, MessageCircle } from "lucide-react";

// ============================================
// Hero Section
// ============================================

export function HeroSection() {
  const { user } = useAuth();

  // Logged-in users go to chat, new users go to signup
  const ctaHref = user ? "/chat" : "/signup";
  const ctaLabel = user ? "Go to Chat" : "Upload Your Photo";
  const ctaIcon = user ? <MessageCircle className="h-5 w-5" /> : <Upload className="h-5 w-5" />;
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Background effects */}
      <div className="absolute inset-0 hero-gradient opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15),transparent_70%)]" />

      {/* Floating decorative orbs */}
      <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-brand-purple/10 blur-3xl" />
      <div className="absolute right-1/4 top-1/3 h-48 w-48 animate-pulse rounded-full bg-brand-rose/10 blur-3xl" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 max-w-3xl space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-purple/30 bg-brand-purple/5 px-4 py-1.5 text-sm text-brand-purple backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
          AI-Powered Companionship
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Meet Your{" "}
          <span className="bg-gradient-to-r from-brand-purple via-brand-rose to-brand-purple bg-clip-text text-transparent animate-gradient">
            Soul Mate
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto max-w-xl text-lg text-muted-foreground sm:text-xl">
          {user
            ? "Continue your conversation with your AI companion."
            : "Upload a photo and let AI create your perfect companion — someone who truly understands you, always there when you need them."}
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2 px-8 text-base">
            <Link href={ctaHref}>
              {ctaIcon}
              {ctaLabel}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2 px-8 text-base"
          >
            <Link href="#features">
              See How It Works
              <ArrowDown className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-1 pt-4 text-sm text-muted-foreground">
          <Heart className="h-4 w-4 fill-brand-rose text-brand-rose" />
          <span>Join thousands who found their AI companion</span>
        </div>
      </div>
    </section>
  );
}
