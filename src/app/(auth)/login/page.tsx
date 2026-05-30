import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleButton } from "@/components/auth/google-button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Sign In - SoulMate.ai",
  description: "Sign in to your SoulMate.ai account.",
};

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 p-8 shadow-lg backdrop-blur-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to reconnect with your AI companion
        </p>
      </div>

      <LoginForm />

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
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-brand-purple hover:text-brand-purple/80 underline underline-offset-2"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
