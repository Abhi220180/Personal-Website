import { PageShell } from "@/components/layout/PageShell";
import { ProjectsSection } from "@/components/sections/ProjectsSection";

export default function ProjectsPage() {
  return (
    <PageShell withTopNav>
      <ProjectsSection />
    </PageShell>
  );
}
