"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, User, Users, UserPlus, Palette } from "lucide-react";
import type { CompanionGender, CompanionStyle } from "@/types/companion";
import { GENDER_LABELS, STYLE_LABELS } from "@/types/companion";

// ============================================
// Types
// ============================================

interface PreferenceSelectorProps {
  selectedGender: CompanionGender | null;
  selectedStyle: CompanionStyle | null;
  onGenderChange: (gender: CompanionGender) => void;
  onStyleChange: (style: CompanionStyle) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

// ============================================
// Options Data
// ============================================

const GENDERS: Array<{ value: CompanionGender; icon: typeof User; description: string }> = [
  { value: "male", icon: User, description: "A male-presenting companion" },
  { value: "female", icon: User, description: "A female-presenting companion" },
  { value: "non_binary", icon: Users, description: "A gender-diverse companion" },
  { value: "any", icon: UserPlus, description: "Surprise me!" },
];

const STYLES: Array<{ value: CompanionStyle; icon: typeof Palette; description: string }> = [
  { value: "realistic", icon: Palette, description: "Photorealistic portrait" },
  { value: "anime", icon: Palette, description: "Anime / manga inspired" },
  { value: "fantasy", icon: Palette, description: "Magical & otherworldly" },
];

// ============================================
// Component
// ============================================

export function PreferenceSelector({
  selectedGender,
  selectedStyle,
  onGenderChange,
  onStyleChange,
  onSubmit,
  isSubmitting = false,
}: PreferenceSelectorProps) {
  return (
    <div className="space-y-8">
      {/* Gender Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-purple" />
          Gender Preference
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GENDERS.map(({ value, icon: Icon, description }) => {
            const isSelected = selectedGender === value;
            return (
              <button
                key={value}
                onClick={() => onGenderChange(value)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                  isSelected
                    ? "border-brand-purple bg-brand-purple/10 shadow-md shadow-brand-purple/10"
                    : "border-white/10 hover:border-brand-purple/40 hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${
                    isSelected ? "text-brand-purple" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isSelected ? "text-brand-purple" : ""
                  }`}
                >
                  {GENDER_LABELS[value]}
                </span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Style Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5 text-brand-rose" />
          Art Style
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STYLES.map(({ value, icon: Icon, description }) => {
            const isSelected = selectedStyle === value;
            return (
              <button
                key={value}
                onClick={() => onStyleChange(value)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                  isSelected
                    ? "border-brand-rose bg-brand-rose/10 shadow-md shadow-brand-rose/10"
                    : "border-white/10 hover:border-brand-rose/40 hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${
                    isSelected ? "text-brand-rose" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isSelected ? "text-brand-rose" : ""
                  }`}
                >
                  {STYLE_LABELS[value]}
                </span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={onSubmit}
        disabled={!selectedGender || !selectedStyle || isSubmitting}
        className="w-full gap-2"
        size="lg"
      >
        <Sparkles className="h-5 w-5" />
        {isSubmitting ? "Generating..." : "Generate My Soul Mate"}
      </Button>
    </div>
  );
}
