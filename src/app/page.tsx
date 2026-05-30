import { HeroSection } from "@/components/landing/hero-section";
import { FeatureSection } from "@/components/landing/feature-section";
import { ShowcaseCarousel } from "@/components/landing/showcase-carousel";
import { CTASection } from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <HeroSection />
        <FeatureSection />
        <ShowcaseCarousel />
        <CTASection />
      </main>
    </div>
  );
}
