"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Heart, AlertTriangle } from "lucide-react";

// ============================================
// Types
// ============================================

export type AgeGroup = "child" | "teen" | "adult";

export interface AgeVerificationResult {
  ageGroup: AgeGroup;
  birthYear: number;
}

// ============================================
// Component
// ============================================

interface AgeGateDialogProps {
  onVerify: (result: AgeVerificationResult) => void;
}

export function AgeGateDialog({ onVerify }: AgeGateDialogProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear - 25);
  const [showWarning, setShowWarning] = useState(false);

  const ageGroup = useMemo((): AgeGroup => {
    const age = currentYear - selectedYear;
    if (age < 13) return "child";
    if (age < 18) return "teen";
    return "adult";
  }, [selectedYear, currentYear]);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear - 100; y <= currentYear - 5; y++) {
      list.push(y);
    }
    list.reverse();
    return list;
  }, [currentYear]);

  function handleContinue() {
    if (ageGroup === "child") {
      setShowWarning(true);
      return;
    }
    onVerify({ ageGroup, birthYear: selectedYear });
  }

  if (showWarning) {
    return (
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Sorry, Age Restriction</h2>
          <p className="text-sm text-muted-foreground">
            You must be at least 13 years old to use SoulMate.ai.
            <br />
            We prioritize safety and comply with COPPA regulations.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowWarning(false)}
          className="w-full"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-purple/10">
        <Heart className="h-8 w-8 text-brand-purple" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">Age Verification</h2>
        <p className="text-sm text-muted-foreground">
          Please verify your birth year to continue.
          Your privacy matters — we only store your birth date for safety.
        </p>
      </div>

      <div className="w-full space-y-2">
        <Label htmlFor="birth-year">Select Your Birth Year</Label>
        <select
          id="birth-year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          You are{" "}
          <span className="font-medium text-brand-purple">
            {currentYear - selectedYear} years old
          </span>
        </p>
      </div>

      <Button onClick={handleContinue} className="w-full gap-2">
        <Heart className="h-4 w-4" />
        Continue
      </Button>
    </div>
  );
}
