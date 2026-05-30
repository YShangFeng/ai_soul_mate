"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, Settings, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

// Pages where this root header should NOT appear (chat/profile/settings have their own)
const APP_ROUTES = ["/chat", "/profile", "/settings", "/age-gate", "/upload", "/reveal"];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Don't render on app pages — ChatHeader handles navigation there
  if (APP_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return null;
  }

  async function handleSignOut() {
    await signOut();
    setIsDropdownOpen(false);
    router.push("/");
    router.refresh();
  }

  const isLoggedIn = !!user && !isAuthLoading;
  const initials = user?.email?.split("@")[0]?.slice(0, 2).toUpperCase() ?? "?";

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
            <>
              <Link
                href="/chat"
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                Chat
              </Link>

              {/* User dropdown — Settings + Logout only */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8 border border-border/50">
                    <AvatarFallback className="bg-brand-purple/10 text-xs text-brand-purple">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border/40 bg-card/95 p-1 shadow-lg backdrop-blur-md">
                    <DropdownItem
                      icon={Settings}
                      label="Settings"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push("/settings");
                      }}
                    />
                    <hr className="my-1 border-border/40" />
                    <DropdownItem
                      icon={LogOut}
                      label="Sign Out"
                      onClick={handleSignOut}
                      destructive
                    />
                  </div>
                )}
              </div>
            </>
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

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <nav className="border-t border-border/30 bg-background/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col p-4">
            {isLoggedIn ? (
              <>
                <MobileLink href="/chat" label="Chat" onClick={() => setIsMenuOpen(false)} />
                <MobileLink href="/settings" label="Settings" onClick={() => setIsMenuOpen(false)} />
                <hr className="my-2 border-border/40" />
                <MobileLink href="#" label="Sign Out" onClick={() => { setIsMenuOpen(false); handleSignOut(); }} />
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

// ============================================
// Sub-components
// ============================================

function DropdownItem({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: typeof Settings;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
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
