"use client";

import { heroNameLine, heroPlanetLinks, heroSchoolLine } from "@/lib/content";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const GlbOrbitCard = dynamic(
  () => import("@/components/three/GlbOrbitCard").then((module) => module.GlbOrbitCard),
  { ssr: false }
);

export function HeroSection() {
  const router = useRouter();

  return (
    <section id="top" className="relative min-h-[92vh] section-rule">
      <div className="relative flex min-h-[92vh] w-full flex-col px-4 pb-10 pt-6 md:px-10 md:pb-12 md:pt-10">
        <div className="relative z-20 flex items-start justify-between gap-3 md:block">
          <div className="shrink-0 md:absolute md:left-10 md:top-10">
            <Image
              src="/images/website-profile-pic.jpg"
              alt="Abhinav Gummadi profile picture"
              width={400}
              height={400}
              className="h-[140px] w-[140px] rounded-full border border-white/45 object-cover shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:h-[240px] md:w-[240px]"
              priority
            />
          </div>

          <div className="shrink-0 md:absolute md:right-10 md:top-10">
            <a
              href="https://www.wisc.edu/"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex flex-col items-center gap-1.5 md:gap-2"
              aria-label="University of Wisconsin-Madison"
            >
              <Image
                src="/assets/bucky-plush.webp"
                alt="UW Madison Bucky plush"
                width={220}
                height={220}
                className="h-auto w-[84px] bg-transparent mix-blend-screen transition-transform duration-300 group-hover:scale-[1.03] md:w-[150px] lg:w-[170px]"
                priority
              />
              <span className="font-['Press_Start_2P'] text-[8px] uppercase tracking-[0.08em] text-white/90 md:text-[10px] md:tracking-[0.09em]">
                Click Plushie: UW
              </span>
            </a>
          </div>
        </div>

        <p className="relative z-20 mt-5 w-full text-center font-['Press_Start_2P'] text-[20px] uppercase leading-[1.3] tracking-[0.08em] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)] sm:text-[24px] md:absolute md:left-[290px] md:top-10 md:mt-0 md:max-w-[calc(100%-480px)] md:text-left md:text-[36px] md:tracking-[0.10em] lg:text-[46px] xl:text-[56px]">
          <span className="block">{heroNameLine}</span>
        </p>

        <p className="relative z-20 mt-4 w-full text-center font-['Press_Start_2P'] text-[14px] uppercase leading-[1.45] tracking-[0.08em] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)] sm:text-[18px] md:absolute md:left-1/2 md:top-72 md:mt-0 md:w-[min(760px,calc(100%-340px))] md:-translate-x-1/2 md:text-[32px] md:leading-[1.3] md:tracking-[0.10em] lg:text-[40px] xl:text-[48px]">
          {heroSchoolLine}
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3 md:mt-auto md:gap-7">
          {heroPlanetLinks.map((planet) => (
            <GlbOrbitCard
              key={planet.id}
              modelPath={planet.modelPath}
              label={planet.label}
              scale={(planet.scale ?? 1) * 0.8}
              autoRotateSpeed={0.24}
              className="h-[220px] sm:h-[280px] md:h-[320px]"
              onActivate={() => router.push(planet.href)}
              ariaLabel={`Open ${planet.label} section`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
