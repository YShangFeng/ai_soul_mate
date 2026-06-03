"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function PricingPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const getPlanHref = (planName: string) => {
    if (planName === "Free") return isLoggedIn ? "/chat" : "/signup";
    return isLoggedIn ? "/settings" : "/signup";
  };

  const plans = [
    {
      name: "Free", price: "$0", period: "forever",
      description: "Get started with your first AI companion",
      features: ["1 AI companion", "10 messages per day", "Basic avatar generation", "Standard response quality"],
      cta: isLoggedIn ? "Go to Chat" : "Get Started Free",
    },
    {
      name: "Moon", price: "$9.99", period: "/ month",
      description: "Deeper connections, unlimited conversations",
      features: ["2 AI companions", "Unlimited messages", "Priority avatar generation", "Enhanced response quality", "Custom relationship types"],
      cta: isLoggedIn ? "Upgrade Now" : "Start Free Trial",
      featured: true,
    },
    {
      name: "Starlight", price: "$69.99", period: "/ year",
      description: "The ultimate AI companion experience",
      features: ["5 AI companions", "Unlimited messages", "Ultra-quality avatar generation", "Premium response quality", "All relationship types", "Priority support"],
      cta: isLoggedIn ? "Upgrade Now" : "Start Free Trial",
      savedLabel: "Save 42%",
    },
  ];

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
        {plans.map((plan) => (
          <div key={plan.name} className={`relative flex flex-col rounded-2xl border p-8 transition-shadow ${
            plan.featured ? "border-brand-purple bg-brand-purple/5 shadow-lg shadow-brand-purple/10" : "border-border/40 bg-card/60"
          }`}>
            {plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-purple px-4 py-1 text-xs font-semibold text-white">Most Popular</span>}
            {plan.savedLabel && <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-brand-rose/10 px-3 py-0.5 text-xs font-medium text-brand-rose"><Star className="h-3 w-3 fill-brand-rose" /> {plan.savedLabel}</span>}

            <div className="mb-6">
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <div className="mt-3 flex items-baseline gap-0.5"><span className="text-4xl font-bold">{plan.price}</span><span className="text-sm text-muted-foreground">{plan.period}</span></div>
              <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {plan.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" />{f}</li>)}
            </ul>

            <Button asChild className="w-full" variant={plan.featured ? "default" : "outline"}>
              <Link href={getPlanHref(plan.name)}>{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
