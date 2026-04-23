import { PageShell } from "@/components/layout/PageShell";
import { AboutSection } from "@/components/sections/BioSection";

export default function WhoIAmPage() {
  return (
    <PageShell withTopNav>
      <AboutSection />
    </PageShell>
  );
}
