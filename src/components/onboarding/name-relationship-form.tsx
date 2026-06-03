"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Heart, Users, GraduationCap, Star, Loader2, Lock, Shuffle } from "lucide-react";
import type { Relationship } from "@/types/companion";
import { RELATIONSHIP_LABELS } from "@/types/companion";

// ============================================
// Types
// ============================================

interface NameRelationshipFormProps {
  avatarUrl: string;
  ageGroup: "teen" | "adult";
  onSubmit: (name: string, relationship: Relationship) => Promise<void>;
}

// ============================================
// Relationship Options
// ============================================

interface RelationOption {
  value: Relationship;
  icon: typeof Heart;
  description: string;
}

const RELATIONSHIPS: RelationOption[] = [
  {
    value: "romantic_partner",
    icon: Heart,
    description: "Your AI lover, always there for you",
  },
  {
    value: "close_friend",
    icon: Users,
    description: "Your best friend who never judges",
  },
  {
    value: "life_mentor",
    icon: GraduationCap,
    description: "Your personal guide and motivator",
  },
  {
    value: "fictional_character",
    icon: Star,
    description: "A character from your imagination",
  },
];

// ============================================
// Random Name Generator
// ============================================

const RANDOM_NAMES = [
  // Warm & cozy
  "Luna", "Kai", "Aria", "Leo", "Nova", "Zara", "Ezra", "Iris",
  "Milo", "Eden", "Finn", "Lyra", "Juno", "Atlas", "Rory", "Cleo",
  "Theo", "Vera", "Orion", "Sage", "Ciel", "Mira", "Eli", "Nia",
  "Ash", "Lumi", "Koa", "Rune", "Zephyr", "Sol",
  // Romantic
  "Amara", "Dante", "Celeste", "Valentine", "Seraphina", "Rose",
  // Mystical
  "Shadow", "Ember", "Storm", "Frost", "Willow", "Onyx",
  // Eastern-inspired
  "Mei", "Ren", "Sora", "Hana", "Yuki", "Riku",
  // Fantasy
  "Aeris", "Thorne", "Elowen", "Dorian", "Faye", "Caspian",
];

function generateRandomName(): string {
  return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]!;
}

// ============================================
// Component
// ============================================

export function NameRelationshipForm({
  avatarUrl,
  ageGroup,
  onSubmit,
}: NameRelationshipFormProps) {
  const [name, setName] = useState("");
  const [selectedRelationship, setSelectedRelationship] =
    useState<Relationship | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isTeen = ageGroup === "teen";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please give your companion a name.");
      return;
    }
    if (trimmedName.length < 2 || trimmedName.length > 20) {
      setError("Name must be 2–20 characters.");
      return;
    }
    if (!selectedRelationship) {
      setError("Please choose a relationship type.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(trimmedName, selectedRelationship);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Avatar preview */}
      <div className="flex justify-center">
        <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-brand-purple/30 shadow-lg shadow-brand-purple/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt="Your companion"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Name input */}
      <div className="space-y-2">
        <Label htmlFor="companion-name">What&apos;s their name?</Label>
        <div className="flex gap-2">
          <Input
            id="companion-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Luna, Kai, Aria..."
            maxLength={20}
            disabled={isSubmitting}
            autoFocus
            required
            className="text-center text-lg flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0"
            onClick={() => setName(generateRandomName())}
            disabled={isSubmitting}
            title="Random name"
          >
            <Shuffle className="h-5 w-5 text-brand-purple" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          2–20 characters. Click the ⟳ icon for a random name ✨
        </p>
      </div>

      {/* Relationship selection */}
      <div className="space-y-3">
        <Label>How do you see your relationship?</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {RELATIONSHIPS.map(({ value, icon: Icon, description }) => {
            const isLocked = isTeen && value === "romantic_partner";
            const isSelected = selectedRelationship === value;

            return (
              <button
                key={value}
                type="button"
                disabled={isLocked || isSubmitting}
                onClick={() => {
                  if (!isLocked) setSelectedRelationship(value);
                }}
                className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  isLocked
                    ? "cursor-not-allowed border-white/10 bg-white/5 opacity-50"
                    : isSelected
                      ? "border-brand-purple bg-brand-purple/10 shadow-md shadow-brand-purple/10"
                      : "border-white/10 hover:border-brand-purple/30 hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    isSelected ? "text-brand-purple" : "text-muted-foreground"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? "text-brand-purple" : ""
                      }`}
                    >
                      {RELATIONSHIP_LABELS[value]}
                    </span>
                    {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{description}</p>
                  {isLocked && (
                    <p className="mt-1 text-xs text-brand-rose/70">
                      Available at 18+
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {isTeen && (
          <p className="text-xs text-muted-foreground text-center">
            💡 Romantic Partner mode unlocks when you turn 18.
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting || !name.trim() || !selectedRelationship}
        className="w-full gap-2"
        size="lg"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        {isSubmitting ? "Creating..." : "Complete & Start Chatting"}
      </Button>
    </form>
  );
}
