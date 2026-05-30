import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication - SoulMate.ai",
  description: "Sign in or create your SoulMate.ai account.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Auth background with gradient */}
      <div className="absolute inset-0 hero-gradient" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center gap-2 text-2xl font-bold">
          <Heart className="h-7 w-7 fill-brand-rose text-brand-rose" />
          <span>
            SoulMate<span className="text-brand-purple">.ai</span>
          </span>
        </Link>

        {/* Centered card container */}
        <div className="w-full max-w-md">{children}</div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
