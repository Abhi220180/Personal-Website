import { InteractiveNodeExplorer } from "@/components/sections/InteractiveNodeExplorer";
import type { SphereNode } from "@/lib/types";
import dynamic from "next/dynamic";

const GlbOrbitCard = dynamic(
  () => import("@/components/three/GlbOrbitCard").then((module) => module.GlbOrbitCard),
  { ssr: false }
);

const experienceSphereNodes: SphereNode[] = [
  {
    id: "nova",
    label: "NOVA",
    category: "Experience",
    roleName: "Vehicle Engineer",
    href: "https://nova-utd.github.io/",
    iconSrc: "/images/nodes/nova.jpg",
    color: "#f97316",
    ringColor: "#ea580c",
    summary:
      "Collaborated in a student engineering environment on hands-on technical initiatives and team execution.",
    highlights: [
      "Built CARLA-based pedestrian-detection workflows using LiDAR point-cloud data to support simulation-driven perception testing for NOVA's open-source self-driving platform",
      "Integrated an NVIDIA AGX compute module with ZED camera systems to enable onboard sensor processing and embedded perception workloads",
      "Used CUDA on NVIDIA hardware to support GPU-accelerated perception workloads in real-time autonomous driving experiments"
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
      "Trained an EfficientNet-based image classifier for traffic sign recognition, achieving 87% validation accuracy using BDD100K and internal data",
      "Built a two-stage perception pipeline for bounding-box detection and classification, achieving 83 ms camera-to-recognition latency",
      "Evaluated MATLAB/Simulink sim-to-real generalization across 1,000 images per class, finding only a 1.5% accuracy gap between simulated and real-world traffic sign data"
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
