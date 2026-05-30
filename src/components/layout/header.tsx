"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const APP_ROUTES = ["/chat", "/profile", "/settings", "/age-gate", "/upload", "/reveal"];

export function Header() {
  const pathname = usePathname();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoggedIn = !!user && !isAuthLoading;

  // Don't render on app pages
  if (APP_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return null;
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <Heart className="h-5 w-5 fill-brand-rose text-brand-rose" />
          <span>
            SoulMate<span className="text-brand-purple">.ai</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {isLoggedIn ? (
            <Link
              href="/settings"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Settings
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                Log In
              </Link>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up Free</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {isMenuOpen && (
        <nav className="border-t border-border/30 bg-background/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col p-4">
            {isLoggedIn ? (
              <>
                <MobileLink href="/settings" label="Settings" onClick={() => setIsMenuOpen(false)} />
              </>
            ) : (
              <>
                <MobileLink href="/login" label="Log In" onClick={() => setIsMenuOpen(false)} />
                <MobileLink href="/signup" label="Sign Up Free" onClick={() => setIsMenuOpen(false)} />
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

function MobileLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
    >
      {label}
    </Link>
  );
}
