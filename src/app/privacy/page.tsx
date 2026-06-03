import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - SoulMate.ai",
  description: "Privacy Policy for SoulMate.ai",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-8">
      <Link href="/" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <h1 className="mb-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: June 3, 2026</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>When you sign up, we collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email address, name, and birth year (for age verification)</li>
            <li>Uploaded photos (processed temporarily for avatar generation)</li>
            <li>Chat messages with your AI companion</li>
            <li>Billing information (processed securely by Stripe, not stored by us)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To create and personalize your AI companion</li>
            <li>To enable conversations with your companion</li>
            <li>To process payments and manage your subscription</li>
            <li>To improve our service and train our AI models (in anonymized form)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Data Storage & Security</h2>
          <p>Your data is stored on Supabase (encrypted at rest) and processed through Vercel edge infrastructure. We implement industry-standard security measures.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Third-Party Services</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase</strong> — database and authentication</li>
            <li><strong>SiliconFlow / DeepSeek</strong> — AI model inference</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Vercel</strong> — hosting and deployment</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Your Rights</h2>
          <p>You can request data deletion by emailing <a href="mailto:support@soulmate.ai" className="text-brand-purple hover:underline">support@soulmate.ai</a>. We will process your request within 30 days.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Contact</h2>
          <p>Questions? <a href="mailto:support@soulmate.ai" className="text-brand-purple hover:underline">support@soulmate.ai</a></p>
        </section>
      </div>
    </div>
  );
}
