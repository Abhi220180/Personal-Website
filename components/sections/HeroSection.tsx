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
      <div className="relative flex min-h-[92vh] w-full flex-col px-6 pb-10 pt-8 md:px-10 md:pb-12 md:pt-10">
        <p className="absolute left-[210px] top-8 z-20 max-w-[calc(100%-320px)] font-['Press_Start_2P'] text-[26px] uppercase leading-[1.3] tracking-[0.10em] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)] md:left-[290px] md:top-10 md:max-w-[calc(100%-480px)] md:text-[36px] lg:text-[46px] xl:text-[56px]">
          <span className="block">{heroNameLine}</span>
        </p>

        <p className="absolute left-1/2 top-56 z-20 w-[min(760px,calc(100%-340px))] -translate-x-1/2 text-center font-['Press_Start_2P'] text-[22px] uppercase leading-[1.3] tracking-[0.10em] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)] md:top-72 md:text-[32px] lg:text-[40px] xl:text-[48px]">
          {heroSchoolLine}
        </p>

        <div className="absolute right-6 top-8 z-20 md:right-10 md:top-10">
          <a
            href="https://www.wisc.edu/"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex flex-col items-center gap-2"
            aria-label="University of Wisconsin-Madison"
          >
            <Image
              src="/assets/bucky-plush.webp"
              alt="UW Madison Bucky plush"
              width={220}
              height={220}
              className="h-auto w-[98px] bg-transparent mix-blend-screen transition-transform duration-300 group-hover:scale-[1.03] md:w-[150px] lg:w-[170px]"
              priority
            />
            <span className="font-['Press_Start_2P'] text-[10px] uppercase tracking-[0.09em] text-white/90">
              Click Plushie: UW
            </span>
          </a>
        </div>

        <div className="absolute left-6 top-8 z-20 md:left-10 md:top-10">
          <Image
            src="/images/website-profile-pic.jpg"
            alt="Abhinav Gummadi profile picture"
            width={400}
            height={400}
            className="h-[168px] w-[168px] rounded-full border border-white/45 object-cover shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:h-[240px] md:w-[240px]"
            priority
          />
        </div>

        <div className="mt-auto grid gap-6 sm:grid-cols-3 md:gap-7">
          {heroPlanetLinks.map((planet) => (
            <GlbOrbitCard
              key={planet.id}
              modelPath={planet.modelPath}
              label={planet.label}
              scale={(planet.scale ?? 1) * 0.8}
              autoRotateSpeed={0.24}
              className="h-[260px] sm:h-[280px] md:h-[320px]"
              onActivate={() => router.push(planet.href)}
              ariaLabel={`Open ${planet.label} section`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
