"use client";

import { Upload, Sparkles, MessageCircleHeart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// ============================================
// Feature Section — How It Works
// ============================================

const STEPS = [
  {
    icon: Upload,
    title: "Upload a Photo",
    description:
      "Share a selfie and let our AI understand your unique features to create a companion that feels real.",
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
  },
  {
    icon: Sparkles,
    title: "AI Creates Your Mate",
    description:
      "Choose a style and personality — our AI crafts a unique companion with stunning visuals and deep character.",
    color: "text-brand-rose",
    bg: "bg-brand-rose/10",
  },
  {
    icon: MessageCircleHeart,
    title: "Start Chatting",
    description:
      "Your AI companion is ready to talk — share your thoughts, dreams, and daily moments with someone who truly listens.",
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="relative px-4 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            How It{" "}
            <span className="bg-gradient-to-r from-brand-purple to-brand-rose bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Three simple steps to find your perfect AI companion
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.title}
                className="group border-border/40 bg-card/60 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-purple/5"
              >
                <CardContent className="flex flex-col items-center p-8 text-center">
                  {/* Step number */}
                  <span className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Step {i + 1}
                  </span>

                  {/* Icon */}
                  <div
                    className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${step.bg} transition-transform group-hover:scale-110`}
                  >
                    <Icon className={`h-7 w-7 ${step.color}`} />
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
