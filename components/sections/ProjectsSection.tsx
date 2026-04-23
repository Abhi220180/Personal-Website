import { InteractiveNodeExplorer } from "@/components/sections/InteractiveNodeExplorer";
import { LazyGlbOrbitCard } from "@/components/three/LazyGlbOrbitCard";
import { modelPaths, projectSphereNodes } from "@/lib/content";

export function ProjectsSection() {
  return (
    <section id="projects" className="section-rule">
      <div className="w-full px-6 py-24 md:px-10 md:py-28">
        <p className="font-['Press_Start_2P'] text-[10px] uppercase tracking-[0.09em] text-white/90">Projects</p>

        <div className="relative mt-10">
          <div className="flex justify-end xl:absolute xl:right-0 xl:-top-44">
            <LazyGlbOrbitCard
              modelPath={modelPaths.projects}
              label="Shiverburn"
              showLabel={false}
              scale={0.95}
              className="h-[250px] w-[250px] sm:h-[290px] sm:w-[290px] lg:h-[320px] lg:w-[320px]"
            />
          </div>

          <div className="mt-8 xl:mt-0 xl:max-w-none">
            <article className="mb-6 border border-white/30 bg-black/30 p-5 backdrop-blur-sm xl:max-w-[560px]">
              <h3 className="font-['Press_Start_2P'] text-sm uppercase tracking-[0.09em] text-white">
                How to use Isosphere:
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/85 md:text-base md:leading-8">
                Drag the Isosphere within the window to reveal dots, which when hovered over, can
                reveal the project and when clicked, will take you to the project link.
              </p>
            </article>

            <InteractiveNodeExplorer nodes={projectSphereNodes} panelHeading="Project Details" />
          </div>
        </div>
      </div>
    </section>
  );
}
