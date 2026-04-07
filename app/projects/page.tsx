import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { PageTopNav } from "@/components/ui/PageTopNav";

export default function ProjectsPage() {
  return (
    <main className="relative overflow-x-clip text-ink">
      <PageTopNav />
      <ProjectsSection />
    </main>
  );
}

