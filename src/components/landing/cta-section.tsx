"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Star, Upload } from "lucide-react";

// ============================================
// CTA Section
// ============================================

export function CTASection() {
  return (
    <section className="relative overflow-hidden px-4 py-24">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-brand-purple/5 to-background" />
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-purple/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {/* Stars */}
        <div className="mb-4 flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="h-5 w-5 fill-brand-rose text-brand-rose"
            />
          ))}
        </div>

        <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
          Ready to meet your{" "}
          <span className="bg-gradient-to-r from-brand-purple to-brand-rose bg-clip-text text-transparent">
            soul mate
          </span>
          ?
        </h2>

        <p className="mb-8 text-lg text-muted-foreground">
          Take the first step toward a meaningful AI connection.
          Your perfect companion is just one photo away.
        </p>

        <Button asChild size="lg" className="gap-2 px-12 py-6 text-lg">
          <Link href="/signup">
            <Upload className="h-6 w-6" />
            Upload Your Photo
          </Link>
        </Button>

        <p className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <Heart className="h-4 w-4 fill-brand-rose text-brand-rose" />
          Join thousands who found their AI companion
        </p>
      </div>
    </section>
  );
}
