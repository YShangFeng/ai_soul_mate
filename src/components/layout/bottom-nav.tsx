"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, User } from "lucide-react";

// ============================================
// Tab Definitions
// ============================================

interface Tab {
  label: string;
  href: string;
  icon: typeof MessageCircle;
}

const TABS: Tab[] = [
  { label: "Chat", href: "/chat", icon: MessageCircle },
  { label: "Profile", href: "/profile", icon: User },
];

// ============================================
// Component
// ============================================

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/90 backdrop-blur-lg safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-6 py-2 transition-colors ${
                isActive
                  ? "text-brand-purple"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform ${
                  isActive ? "fill-brand-purple/20 scale-110" : ""
                }`}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-px h-0.5 w-8 rounded-full bg-brand-purple" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
