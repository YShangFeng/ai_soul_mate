import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy - SoulMate.ai",
  description: "Our refund policy for SoulMate.ai subscription services.",
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <h1 className="mb-2 text-3xl font-bold tracking-tight">Refund Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Last updated: June 3, 2026
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">1. Subscription Services</h2>
          <p>
            SoulMate.ai offers subscription-based services with the following plans:
            Free, Moon ($9.99/month), and Starlight ($69.99/year). By subscribing,
            you agree to the billing terms presented at the time of purchase.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Refund Eligibility</h2>
          <p>
            You may request a full refund within <strong>24 hours</strong> of your purchase,
            provided that you have <strong>not used any VIP features</strong> (unlimited
            messages, premium avatar generation, etc.) during that period.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Non-Refundable Cases</h2>
          <p>Refunds will not be issued in the following circumstances:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>More than 24 hours have passed since your purchase.</li>
            <li>You have used VIP-exclusive features during the current billing period.</li>
            <li>Violation of our Terms of Service.</li>
            <li>Chargebacks or disputes filed without first contacting us.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. How to Request a Refund</h2>
          <p>To request a refund, email us at:</p>
          <p className="font-medium">
            <a
              href="mailto:support@soulmate.ai"
              className="text-brand-purple hover:underline"
            >
              support@soulmate.ai
            </a>
          </p>
          <p>Please include:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The email address associated with your account</li>
            <li>The subscription plan you purchased</li>
            <li>The date and amount of the charge</li>
            <li>A brief reason for your refund request</li>
          </ul>
          <p className="mt-2">We aim to process all refund requests within 5 business days.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Refund Processing</h2>
          <p>
            Approved refunds will be credited to the original payment method. Depending on
            your bank or card issuer, it may take 5-10 business days for the refund to appear
            on your statement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Changes to This Policy</h2>
          <p>
            We reserve the right to update this Refund Policy at any time. Changes will be
            posted on this page with an updated revision date. Continued use of our services
            after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Contact</h2>
          <p>
            If you have any questions about this Refund Policy, please contact us at{" "}
            <a
              href="mailto:support@soulmate.ai"
              className="text-brand-purple hover:underline"
            >
              support@soulmate.ai
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
