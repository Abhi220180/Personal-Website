import { InteractiveNodeExplorer } from "@/components/sections/InteractiveNodeExplorer";
import type { SphereNode } from "@/lib/types";
import dynamic from "next/dynamic";

const GlbOrbitCard = dynamic(
  () => import("@/components/three/GlbOrbitCard").then((module) => module.GlbOrbitCard),
  { ssr: false }
);

const experienceSphereNodes: SphereNode[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    category: "Experience",
    roleName: "Professional Profile",
    href: "https://www.linkedin.com/in/abhinavgummadi/",
    iconSrc: "/images/nodes/linkedin.png",
    color: "#0a66c2",
    ringColor: "#004182",
    summary: "Professional timeline and public profile with roles, projects, and technical growth highlights.",
    highlights: [
      "Technical communication and resume framing",
      "Professional networking strategy",
      "Experience documentation and role storytelling"
    ],
    anchorIndex: 0
  },
  {
    id: "nova",
    label: "NOVA",
    category: "Experience",
    roleName: "Team Member",
    href: "https://nova-utd.github.io/",
    iconSrc: "/images/nodes/nova.jpg",
    color: "#f97316",
    ringColor: "#ea580c",
    summary:
      "Collaborated in a student engineering environment on hands-on technical initiatives and team execution.",
    highlights: [
      "Cross-functional team collaboration",
      "Applied software + hardware problem solving",
      "Project planning and delivery discipline"
    ],
    anchorIndex: 4
  },
  {
    id: "wisconsin-autonomous",
    label: "Wisconsin Autonomous",
    category: "Experience",
    roleName: "Perception Developer/Engineer",
    href: "https://wa.wisc.edu/",
    iconSrc: "/images/nodes/wisconsin-autonomous.jpg",
    color: "#c5050c",
    ringColor: "#9b0000",
    summary:
      "Worked in autonomous systems-focused student projects, contributing to practical engineering tasks.",
    highlights: [
      "Autonomy-focused system thinking",
      "Rapid prototyping and validation",
      "Iterative debugging in team settings"
    ],
    anchorIndex: 8
  },
  {
    id: "amd",
    label: "AMD",
    category: "Experience",
    roleName: "Graduate Hardware Engineer Co-op",
    href: "https://www.amd.com/",
    iconSrc: "/images/nodes/AMD%20Logo.png",
    color: "#0b0b0f",
    ringColor: "#5aaeb5",
    summary:
      "Doing Design Verification on AMD Accelerators and Datacenter GPUs",
    highlights: [
      "Incoming Fall 2026"
    ],
    anchorIndex: 12
  },
  {
    id: "ibm",
    label: "IBM",
    category: "Experience",
    roleName: "Physical Design Engineer Intern",
    href: "https://www.ibm.com/",
    iconSrc: "/images/nodes/IBM%20Logo.png",
    color: "#f8f9fb",
    ringColor: "#4a84be",
    summary:
      "Developing Silicon Interposer for AI Accelerators",
    highlights: [
      "Incoming Summer 2026"
    ],
    anchorIndex: 16
  }
];

export function ExperienceSection() {
  return (
    <section id="experience" className="section-rule">
      <div className="w-full px-6 py-24 md:px-10 md:py-28">
        <p className="font-['Press_Start_2P'] text-[10px] uppercase tracking-[0.09em] text-white/90">Experience</p>

        <div className="relative mt-10">
          <div className="flex justify-end xl:absolute xl:right-0 xl:-top-44">
            <GlbOrbitCard
              modelPath="/models/bonefin.glb"
              label="Bonefin"
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
                reveal the experience and when clicked, will take you to the experience link.
              </p>
            </article>

            <InteractiveNodeExplorer
              nodes={experienceSphereNodes}
              panelHeading="Experience Details"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
