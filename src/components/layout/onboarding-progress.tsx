"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

// ============================================
// Step Definitions
// ============================================

interface Step {
  slug: string;
  label: string;
  number: number;
}

const STEPS: Step[] = [
  { slug: "age-gate", label: "Age Verification", number: 1 },
  { slug: "upload", label: "Upload Photo", number: 2 },
  { slug: "generating", label: "Generate", number: 3 },
  { slug: "reveal", label: "Reveal", number: 4 },
  { slug: "personalize", label: "Personalize", number: 5 },
];

// ============================================
// Component
// ============================================

export function OnboardingProgress() {
  const pathname = usePathname();

  const currentStepIndex = STEPS.findIndex((step) =>
    pathname.includes(step.slug),
  );

  return (
    <nav aria-label="Onboarding progress" className="w-full px-4 py-6">
      <ol className="flex items-center justify-center gap-2">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isFuture = index > currentStepIndex;

          return (
            <li key={step.slug} className="flex items-center gap-2">
              {/* Step circle */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  isCompleted
                    ? "bg-brand-purple text-white"
                    : isCurrent
                      ? "bg-brand-purple/20 text-brand-purple ring-2 ring-brand-purple"
                      : "bg-white/10 text-muted-foreground"
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>

              {/* Step label (hidden on small screens for all but current) */}
              <span
                className={`hidden text-xs sm:inline-block ${
                  isCurrent
                    ? "font-medium text-brand-purple"
                    : isCompleted
                      ? "text-muted-foreground"
                      : "text-muted-foreground/60"
                } ${isFuture ? "hidden sm:hidden" : ""}`}
              >
                {step.label}
              </span>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`h-px w-6 sm:w-10 ${
                    isCompleted ? "bg-brand-purple" : "bg-white/10"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
