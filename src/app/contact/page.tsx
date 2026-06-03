import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact - SoulMate.ai",
  description: "Contact the SoulMate.ai team",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-8">
      <Link href="/" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <h1 className="mb-2 text-3xl font-bold tracking-tight">Contact Us</h1>
      <p className="mb-8 text-muted-foreground">
        Have questions, feedback, or need help? We&apos;d love to hear from you.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border/40 bg-card/60 p-6 backdrop-blur-sm">
          <Mail className="mb-3 h-8 w-8 text-brand-purple" />
          <h2 className="mb-1 text-lg font-semibold">Email Support</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            For account, billing, or technical issues
          </p>
          <a href="mailto:support@soulmate.ai" className="text-brand-purple hover:underline font-medium">
            support@soulmate.ai
          </a>
          <p className="mt-2 text-xs text-muted-foreground">Response within 24 hours</p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/60 p-6 backdrop-blur-sm">
          <MessageCircle className="mb-3 h-8 w-8 text-brand-purple" />
          <h2 className="mb-1 text-lg font-semibold">Business Inquiries</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Partnerships, press, and commercial
          </p>
          <a href="mailto:hello@soulmate.ai" className="text-brand-purple hover:underline font-medium">
            hello@soulmate.ai
          </a>
          <p className="mt-2 text-xs text-muted-foreground">Response within 2 business days</p>
        </div>
      </div>
    </div>
  );
}
