import { HeroSection } from "@/components/sections/HeroSection";
import { BioSection } from "@/components/sections/BioSection";
import { WhatILikeSection } from "@/components/sections/WhatILikeSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function HomePage() {
  return (
    <main className="relative overflow-x-clip bg-paper text-ink">
      <ThemeToggle />
      <HeroSection />
      <BioSection />
      <WhatILikeSection />
      <ContactSection />
    </main>
  );
}
