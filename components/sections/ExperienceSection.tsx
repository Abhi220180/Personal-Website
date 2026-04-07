import { IcoSphereEmbed } from "@/components/three/IcoSphereEmbed";
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
    href: "https://www.linkedin.com/in/abhinavgummadi/",
    iconSrc: "/images/nodes/linkedin.png",
    color: "#0a66c2",
    ringColor: "#004182",
    anchorIndex: 0
  },
  {
    id: "nova",
    label: "NOVA",
    category: "Experience",
    href: "https://nova-utd.github.io/",
    iconSrc: "/images/nodes/nova.jpg",
    color: "#f97316",
    ringColor: "#ea580c",
    anchorIndex: 4
  },
  {
    id: "wisconsin-autonomous",
    label: "Wisconsin Autonomous",
    category: "Experience",
    href: "https://wa.wisc.edu/",
    iconSrc: "/images/nodes/wisconsin-autonomous.jpg",
    color: "#c5050c",
    ringColor: "#9b0000",
    anchorIndex: 8
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

          <div className="mt-8 xl:mt-0 xl:max-w-3xl">
            <article className="mb-6 border border-white/30 bg-black/30 p-5 backdrop-blur-sm">
              <h3 className="font-['Press_Start_2P'] text-sm uppercase tracking-[0.09em] text-white">
                How to use Isosphere:
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/85 md:text-base md:leading-8">
                Drag the Isosphere within the window to reveal dots, which when hovered over, can
                reveal the experience and when clicked, will take you to the experience link.
              </p>
            </article>

            <div className="mx-auto aspect-square w-full max-w-[560px]">
              <IcoSphereEmbed nodes={experienceSphereNodes} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
