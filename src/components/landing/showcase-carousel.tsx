"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ============================================
// Showcase Data
// ============================================

interface ShowcaseItem {
  style: string;
  label: string;
  description: string;
  gradient: string;
}

const SHOWCASE: ShowcaseItem[] = [
  {
    style: "Realistic",
    label: "Photorealistic",
    description: "Lifelike companions that feel like a real person",
    gradient: "from-brand-purple/30 via-brand-rose/20 to-brand-purple/30",
  },
  {
    style: "Anime",
    label: "Anime Inspired",
    description: "Beautiful anime-style characters full of warmth",
    gradient: "from-sky-400/30 via-purple-400/20 to-pink-400/30",
  },
  {
    style: "Fantasy",
    label: "Fantasy Realm",
    description: "Magical beings from worlds beyond imagination",
    gradient: "from-emerald-400/30 via-teal-400/20 to-cyan-400/30",
  },
];

const AUTO_PLAY_MS = 5_000;

// ============================================
// Component
// ============================================

export function ShowcaseCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SHOWCASE.length);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + SHOWCASE.length) % SHOWCASE.length);
  }, []);

  // Auto-play
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(goNext, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [goNext, isHovered]);

  const item = SHOWCASE[activeIndex];

  return (
    <section className="relative overflow-hidden px-4 py-24">
      {/* Background blur */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Your Style,{" "}
            <span className="bg-gradient-to-r from-brand-purple to-brand-rose bg-clip-text text-transparent">
              Your Choice
            </span>
          </h2>
          <p className="text-muted-foreground">
            Choose from multiple art styles to create your unique companion
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Card */}
          <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-card/60 p-8 backdrop-blur-sm">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-30`}
            />

            <div className="relative z-10 mx-auto flex max-w-xs flex-col items-center text-center">
              {/* Placeholder avatar display */}
              <div className="mb-6 flex h-48 w-48 items-center justify-center rounded-full border-2 border-white/10 bg-white/5 shadow-2xl shadow-brand-purple/10">
                <span className="text-6xl">
                  {item.style === "Realistic" ? "🧑" : item.style === "Anime" ? "🌸" : "✨"}
                </span>
              </div>

              <span className="mb-2 inline-block rounded-full bg-brand-purple/20 px-3 py-1 text-xs font-medium text-brand-purple">
                {item.label}
              </span>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={goPrev}
              className="rounded-full"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {SHOWCASE.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === activeIndex
                      ? "w-6 bg-brand-purple"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goNext}
              className="rounded-full"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
