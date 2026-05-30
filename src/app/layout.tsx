import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SoulMate.ai - Meet Your AI Companion",
    template: "%s - SoulMate.ai",
  },
  description:
    "Create your perfect AI companion. Upload a photo, choose your relationship, and start meaningful daily conversations with your personalized AI soul mate.",
  keywords: ["AI companion", "virtual friend", "AI soul mate"],
  openGraph: {
    title: "SoulMate.ai - Meet Your AI Companion",
    description:
      "Create your perfect AI companion. Upload a photo, choose your relationship, and start meaningful daily conversations.",
    type: "website",
    siteName: "SoulMate.ai",
    images: ["/og-image.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SoulMate.ai - Meet Your AI Companion",
    description:
      "Create your perfect AI companion. Upload a photo, choose your relationship, and start meaningful daily conversations.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AppProviders>
          <Header />
          {children}
          <Footer />
          <Toaster position="top-center" richColors />
        </AppProviders>
      </body>
    </html>
  );
}
