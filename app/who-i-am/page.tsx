import { AboutSection } from "@/components/sections/BioSection";
import { PageTopNav } from "@/components/ui/PageTopNav";

export default function WhoIAmPage() {
  return (
    <main className="relative overflow-x-clip text-ink">
      <PageTopNav />
      <AboutSection />
    </main>
  );
}

