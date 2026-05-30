"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, GraduationCap, Star, Lock, Loader2, AlertTriangle } from "lucide-react";
import type { Relationship } from "@/types/companion";
import { RELATIONSHIP_LABELS } from "@/types/companion";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "@/components/ui/toast";

// ============================================
// Types
// ============================================

interface RelationshipSettingsProps {
  companionId: string;
  currentName: string;
  currentRelationship: Relationship;
  onUpdate: () => void;
}

// ============================================
// Relationship Options
// ============================================

const RELATIONSHIPS: Array<{
  value: Relationship;
  icon: typeof Heart;
  description: string;
}> = [
  { value: "romantic_partner", icon: Heart, description: "Your AI lover, always there for you" },
  { value: "close_friend", icon: Users, description: "Your best friend who never judges" },
  { value: "life_mentor", icon: GraduationCap, description: "Your personal guide and motivator" },
  { value: "fictional_character", icon: Star, description: "A character from your imagination" },
];

const COOLDOWN_DAYS = 7;

// ============================================
// Component
// ============================================

export function RelationshipSettings({
  companionId,
  currentName,
  currentRelationship,
  onUpdate,
}: RelationshipSettingsProps) {
  const { supabase } = useSupabase();
  const [name, setName] = useState(currentName);
  const [relationship, setRelationship] = useState<Relationship>(currentRelationship);
  const [isSaving, setIsSaving] = useState(false);
  const [lastChanged, setLastChanged] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load last change date
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("companions")
        .select("updated_at")
        .eq("id", companionId)
        .single();

      setLastChanged(data?.updated_at ?? null);
      setIsLoading(false);
    }
    load();
  }, [supabase, companionId]);

  const cooldownRemaining = lastChanged
    ? Math.max(0, COOLDOWN_DAYS - daysSince(new Date(lastChanged)))
    : 0;

  const isOnCooldown = cooldownRemaining > 0 && relationship !== currentRelationship;

  async function handleSave() {
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 20) {
      toast({ title: "Invalid name", description: "Name must be 2-20 characters.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("companions")
        .update({
          name: trimmedName,
          relationship,
        })
        .eq("id", companionId);

      if (error) throw error;

      toast({ title: "Updated!", description: "Your companion has been updated." });
      onUpdate();
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="companion-name">Companion Name</Label>
        <Input
          id="companion-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          disabled={isSaving}
        />
        <p className="text-xs text-muted-foreground">2-20 characters</p>
      </div>

      {/* Relationship */}
      <div className="space-y-3">
        <Label>Relationship Type</Label>

        {/* Cooldown warning */}
        {isOnCooldown && (
          <div className="flex items-center gap-2 rounded-md bg-amber-500/10 p-3 text-sm text-amber-500">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            You can change your relationship again in {cooldownRemaining} day{cooldownRemaining === 1 ? "" : "s"}.
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {RELATIONSHIPS.map(({ value, icon: Icon, description }) => {
            const isSelected = relationship === value;
            const isLocked = isOnCooldown && value !== currentRelationship;

            return (
              <button
                key={value}
                type="button"
                disabled={isLocked || isSaving}
                onClick={() => {
                  if (!isLocked) setRelationship(value);
                }}
                className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  isLocked
                    ? "cursor-not-allowed border-white/10 bg-white/5 opacity-50"
                    : isSelected
                      ? "border-brand-purple bg-brand-purple/10"
                      : "border-white/10 hover:border-brand-purple/30 hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    isSelected ? "text-brand-purple" : "text-muted-foreground"
                  }`}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-medium ${isSelected ? "text-brand-purple" : ""}`}>
                      {RELATIONSHIP_LABELS[value]}
                    </span>
                    {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={isSaving || (!name.trim() || (name.trim() === currentName && relationship === currentRelationship))}
        className="w-full gap-2"
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}

// ============================================
// Helpers
// ============================================

function daysSince(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
