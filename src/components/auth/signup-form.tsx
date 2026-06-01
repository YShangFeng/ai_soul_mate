"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { toast } from "@/components/ui/toast";

const currentYear = new Date().getFullYear();

export function SignupForm() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate birth year options (current year down to 100 years ago)
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear; y >= currentYear - 100; y--) {
      years.push(y);
    }
    return years;
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword || !birthYear) {
      setError("Please fill in all fields.");
      return;
    }

    const birthYearNum = Number(birthYear);
    const age = currentYear - birthYearNum;

    if (age < 18) {
      setError("You must be at least 18 years old to use SoulMate.ai.");
      return;
    }

    if (age > 120) {
      setError("Please enter a valid birth year.");
      return;
    }

    if (fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUp(email.trim(), password, fullName.trim(), birthYearNum);

      if (result.error) {
        setError(result.error.message);
        return;
      }

      toast({
        title: "Account created!",
        description: "Welcome to SoulMate.ai. Let's create your companion.",
      });
      // Skip age-gate, go directly to upload since age is already collected
      window.location.href = "/upload";
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="signup-name">Full Name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-birthyear">Birth Year</Label>
        <select
          id="signup-birthyear"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          disabled={isSubmitting}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select year</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">You must be at least 18 years old.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={isSubmitting}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          At least 8 characters with uppercase, lowercase, and a number.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirm Password</Label>
        <Input
          id="signup-confirm"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          disabled={isSubmitting}
          required
        />
      </div>

      <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
