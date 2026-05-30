"use client";

import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, RefreshCw, ArrowRight } from "lucide-react";

// ============================================
// Types
// ============================================

interface AvatarRevealProps {
  imageUrl: string;
  companionName?: string;
  onRegenerate: () => void;
  onContinue: () => void;
  isRegenerating?: boolean;
  canRegenerate?: boolean;
}

// ============================================
// Animation Variants
// ============================================

const revealVariants: Variants = {
  hidden: {
    filter: "blur(20px)",
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.8 + i * 0.2,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const glowVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: [0, 0.6, 0.4, 0.6, 0.3],
    scale: [0.8, 1.1, 1.05, 1.1, 1.05],
    transition: {
      duration: 2,
      ease: "easeOut",
    },
  },
};

// ============================================
// Component
// ============================================

export function AvatarReveal({
  imageUrl,
  companionName,
  onRegenerate,
  onContinue,
  isRegenerating = false,
  canRegenerate = true,
}: AvatarRevealProps) {
  return (
    <div className="flex flex-col items-center space-y-6 text-center">
      {/* Image with reveal animation */}
      <div className="relative">
        {/* Glow effect behind image */}
        <motion.div
          variants={glowVariants}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 -m-4 rounded-full bg-gradient-to-br from-brand-purple via-brand-rose to-brand-purple opacity-0 blur-2xl"
        />

        {/* Image */}
        <motion.div
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-3xl border-2 border-white/20 shadow-2xl shadow-brand-purple/20"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={companionName ?? "Your Soul Mate"}
            className="h-64 w-64 object-cover sm:h-80 sm:w-80"
            loading="eager"
          />
        </motion.div>
      </div>

      {/* Title */}
      <motion.div
        variants={textVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold">
          <Heart className="mr-2 inline-block h-6 w-6 fill-brand-rose text-brand-rose" />
          Your Soul Mate
        </h2>
        <p className="text-sm text-muted-foreground">
          Every detail has been crafted uniquely for you.
          <br />
          Ready to meet them?
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        variants={textVariants}
        initial="hidden"
        animate="visible"
        custom={1}
        className="flex w-full flex-col gap-3 sm:flex-row"
      >
        {canRegenerate && (
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex-1 gap-2"
            size="lg"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`}
            />
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </Button>
        )}

        <Button
          onClick={onContinue}
          disabled={isRegenerating}
          className="flex-1 gap-2"
          size="lg"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}
