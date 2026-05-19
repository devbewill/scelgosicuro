import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Marquee } from "@/components/landing/marquee";
import { NlForm } from "@/components/landing/nl-form";
import { CreativeBento } from "@/components/landing/bento";
import { ImmersiveSection } from "@/components/landing/immersive";
import { StackedStory } from "@/components/landing/stacked-story";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "ScelgoSicuro | Boutique Risk Management per Professionisti",
};

export default function Home() {
  return (
    <div className="bg-warm-white text-ink">
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <NlForm />
        <CreativeBento />
        <ImmersiveSection />
        <StackedStory />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
