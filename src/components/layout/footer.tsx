"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";

const APP_ROUTES = ["/chat", "/profile", "/settings", "/age-gate", "/upload", "/reveal"];

export function Footer() {
  const pathname = usePathname();

  if (APP_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return null;
  }

  return (
    <footer className="border-t border-border/30 bg-card/40 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Heart className="h-4 w-4 fill-brand-rose text-brand-rose" />
          <span>
            SoulMate<span className="text-brand-purple">.ai</span> © {new Date().getFullYear()}
          </span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/refund-policy" className="hover:text-foreground transition-colors">
            Refund Policy
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        <p className="text-xs text-muted-foreground/60">
          Made with ❤️ for meaningful connections
        </p>
      </div>
    </footer>
  );
}
