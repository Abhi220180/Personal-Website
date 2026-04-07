import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { PageTopNav } from "@/components/ui/PageTopNav";

export default function ExperiencePage() {
  return (
    <main className="relative overflow-x-clip text-ink">
      <PageTopNav />
      <ExperienceSection />
    </main>
  );
}

