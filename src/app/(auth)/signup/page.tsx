import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { GoogleButton } from "@/components/auth/google-button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Sign Up - SoulMate.ai",
  description: "Create your SoulMate.ai account and meet your AI companion.",
};

export default function SignupPage() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 p-8 shadow-lg backdrop-blur-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create Your Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start your journey to finding your perfect AI companion
        </p>
      </div>

      <SignupForm />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or continue with</span>
        </div>
      </div>

      <GoogleButton />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-purple hover:text-brand-purple/80 underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
