"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import PaddleCheckoutButton from "@/components/payment/paddle-checkout";

export default function PricingPage() {
  const { user } = useAuth();
  const { plan } = useSubscription();
  const isLoggedIn = !!user;
  const isPaid = plan !== "free";
  const isMoon = plan === "moon";
  const isStarlight = plan === "starlight";

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-8">
      <Link href="/" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
        <p className="text-lg text-muted-foreground">Start free. Upgrade when you&apos;re ready for deeper connections.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Free */}
        <div className="relative flex flex-col rounded-2xl border border-border/40 bg-card/60 p-8 transition-shadow">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Free</h2>
            <div className="mt-3 flex items-baseline gap-0.5"><span className="text-4xl font-bold">$0</span><span className="text-sm text-muted-foreground">forever</span></div>
            <p className="mt-3 text-sm text-muted-foreground">Get started with your first AI companion</p>
          </div>
          <ul className="mb-8 flex-1 space-y-3">
            {["1 AI companion", "10 messages per day", "Basic avatar generation", "Standard response quality"].map((f) => <li key={f} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" />{f}</li>)}
          </ul>
          <Button asChild className="w-full" variant="outline">
            <Link href={isLoggedIn ? "/chat" : "/signup"}>{isLoggedIn ? "Go to Chat" : "Get Started Free"}</Link>
          </Button>
        </div>

        {/* Moon */}
        <div className="relative flex flex-col rounded-2xl border border-brand-purple bg-brand-purple/5 p-8 shadow-lg shadow-brand-purple/10 transition-shadow">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-purple px-4 py-1 text-xs font-semibold text-white">Most Popular</span>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Moon</h2>
            <div className="mt-3 flex items-baseline gap-0.5"><span className="text-4xl font-bold">$9.99</span><span className="text-sm text-muted-foreground">/ month</span></div>
            <p className="mt-3 text-sm text-muted-foreground">Deeper connections, unlimited conversations</p>
          </div>
          <ul className="mb-8 flex-1 space-y-3">
            {["5 AI companions", "Unlimited messages", "Priority avatar generation", "Enhanced response quality", "Custom relationship types"].map((f) => <li key={f} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" />{f}</li>)}
          </ul>
          {isPaid ? (
            <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 w-full px-4 py-2 bg-brand-purple/15 text-brand-purple border border-brand-purple/30 cursor-default">
              {isStarlight ? "Included in Starlight" : "Current Plan"}
            </span>
          ) : isLoggedIn ? (
            <PaddleCheckoutButton tier="moon" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full px-4 py-2" userId={user?.id}>
              Upgrade Now
            </PaddleCheckoutButton>
          ) : (
            <Button asChild className="w-full">
              <Link href="/signup">Start Free Trial</Link>
            </Button>
          )}
        </div>

        {/* Starlight */}
        <div className="relative flex flex-col rounded-2xl border border-border/40 bg-card/60 p-8 transition-shadow">
          <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-brand-rose/10 px-3 py-0.5 text-xs font-medium text-brand-rose"><Star className="h-3 w-3 fill-brand-rose" /> Save 42%</span>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Starlight</h2>
            <div className="mt-3 flex items-baseline gap-0.5"><span className="text-4xl font-bold">$69.99</span><span className="text-sm text-muted-foreground">/ year</span></div>
            <p className="mt-3 text-sm text-muted-foreground">The ultimate AI companion experience</p>
          </div>
          <ul className="mb-8 flex-1 space-y-3">
            {["10 AI companions", "Unlimited messages", "Ultra-quality avatar generation", "Premium response quality", "All relationship types", "Priority support"].map((f) => <li key={f} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" />{f}</li>)}
          </ul>
          {isStarlight ? (
            <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 w-full px-4 py-2 bg-brand-rose/10 text-brand-rose border border-brand-rose/20 cursor-default">
              Current Plan
            </span>
          ) : isLoggedIn ? (
            <PaddleCheckoutButton tier="starlight" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-full px-4 py-2" userId={user?.id}>
              {isMoon ? "Upgrade to Starlight" : "Upgrade Now"}
            </PaddleCheckoutButton>
          ) : (
            <Button asChild className="w-full" variant="outline">
              <Link href="/signup">Start Free Trial</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
