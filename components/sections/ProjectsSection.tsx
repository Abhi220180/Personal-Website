import { InteractiveNodeExplorer } from "@/components/sections/InteractiveNodeExplorer";
import type { SphereNode } from "@/lib/types";
import dynamic from "next/dynamic";

const GlbOrbitCard = dynamic(
  () => import("@/components/three/GlbOrbitCard").then((module) => module.GlbOrbitCard),
  { ssr: false }
);

const projectSphereNodes: SphereNode[] = [
  {
    id: "black-hole-engine",
    label: "Black Hole Engine",
    category: "Project",
    href: "https://github.com/Abhi220180/Black-Hole-Engine.git",
    iconSrc: "/images/nodes/black-hole-engine.png",
    color: "#000000",
    ringColor: "#f97316",
    summary:
      "Built a graphics-heavy sandbox focused on simulation visuals and interactive rendering behavior.",
    highlights: [
      "C++ architecture and rendering pipeline work",
      "Interactive systems design and debugging",
      "Performance-focused engine iteration"
    ],
    anchorIndex: 4
  },
  {
    id: "personal-website",
    label: "Personal Website",
    category: "Project",
    href: "https://github.com/Abhi220180/Personal-Website.git",
    iconSrc: "/images/personalwebsiteicon.png",
    color: "#ef4444",
    ringColor: "#991b1b",
    summary:
      "Designed and shipped this interactive portfolio with custom 3D navigation and responsive editorial layout.",
    highlights: [
      "Next.js + TypeScript application structure",
      "React Three Fiber scene composition",
      "Frontend performance and caching optimization"
    ],
    anchorIndex: 12
  },
  {
    id: "f1-simulator-project",
    label: "F1 Simulator Project",
    category: "Project",
    href: "https://github.com/KushagraBharti/F1-ReinforcementLearning",
    iconSrc: "/images/nodes/Tsunoda_Red_Bull_041125.webp",
    color: "#1d4ed8",
    ringColor: "#dc2626",
    summary:
      "Contributed to a reinforcement-learning-based F1 simulator workflow with model training experimentation.",
    highlights: [
      "Python + ML experimentation pipeline",
      "Simulation environment integration",
      "Result analysis and iteration"
    ],
    anchorIndex: 8
  },
  {
    id: "github",
    label: "GitHub",
    category: "Project",
    href: "https://github.com/Abhi220180",
    iconSrc: "/images/githubicon.svg",
    color: "#a855f7",
    ringColor: "#581c87",
    summary: "Central profile for projects, code samples, and development activity history.",
    highlights: [
      "Version control workflow",
      "Project documentation and code organization",
      "Open-source collaboration habits"
    ],
    anchorIndex: 0
  }
];

export function ProjectsSection() {
  return (
    <section id="projects" className="section-rule">
      <div className="w-full px-6 py-24 md:px-10 md:py-28">
        <p className="font-['Press_Start_2P'] text-[10px] uppercase tracking-[0.09em] text-white/90">Projects</p>

        <div className="relative mt-10">
          <div className="flex justify-end xl:absolute xl:right-0 xl:-top-44">
            <GlbOrbitCard
              modelPath="/models/shiverburn.glb"
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

            <InteractiveNodeExplorer
              nodes={projectSphereNodes}
              panelHeading="Project Details"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
