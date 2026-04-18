"use client";

import { allModelPaths, heroNameLine, heroPlanetLinks, heroSchoolLine } from "@/lib/content";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const GlbOrbitCard = dynamic(
  () => import("@/components/three/GlbOrbitCard").then((module) => module.GlbOrbitCard),
  { ssr: false }
);

export function HeroSection() {
  const router = useRouter();

  useEffect(() => {
    const connection = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
          effectiveType?: string;
        };
      }
    ).connection;

    if (
      connection?.saveData ||
      connection?.effectiveType === "2g" ||
      connection?.effectiveType === "slow-2g"
    ) {
      return;
    }

    const preload = async () => {
      const { useGLTF } = await import("@react-three/drei");
      for (const modelPath of allModelPaths) {
        useGLTF.preload(modelPath);
      }
    };

    const timeoutId = window.setTimeout(preload, 650);
    return () => window.clearTimeout(timeoutId);
  }, []);

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
              className="h-[84px] w-[84px] rounded-full border border-white/45 object-cover shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:h-[150px] md:w-[150px] lg:h-[170px] lg:w-[170px]"
              priority
            />
            {/* Social icons below profile picture */}
            <div className="mt-2.5 flex items-center justify-center gap-3">
              {/* LinkedIn icon */}
              <a
                href="https://www.linkedin.com/in/abhinavgummadi/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn profile"
                className="group relative flex items-center justify-center transition-transform duration-150 hover:scale-110 active:scale-95"
              >
                <Image
                  src="/images/8bitlinkedin.png"
                  alt="LinkedIn"
                  width={32}
                  height={32}
                  className="h-[28px] w-[28px] object-contain image-rendering-pixelated md:h-[36px] md:w-[36px]"
                  style={{ imageRendering: "pixelated" }}
                />
              </a>
              {/* Email icon with hover tooltip */}
              <div className="group relative flex items-center justify-center">
                <button
                  aria-label="Email address"
                  className="flex items-center justify-center transition-transform duration-150 hover:scale-110 active:scale-95"
                >
                  <Image
                    src="/images/8bitmail.png"
                    alt="Email"
                    width={32}
                    height={32}
                    className="h-[28px] w-[28px] object-contain md:h-[36px] md:w-[36px]"
                    style={{ imageRendering: "pixelated" }}
                  />
                </button>
                {/* Tooltip */}
                <div
                  className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded border border-white/30 bg-black/80 px-2.5 py-1.5 font-['Press_Start_2P'] text-[7px] text-white/90 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 md:text-[8px]"
                  role="tooltip"
                >
                  abhinavgummadi.work@gmail.com
                  {/* Tooltip arrow */}
                  <span className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-black/80" />
                </div>
              </div>
            </div>
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
                Click Bucky The Plushie
              </span>
            </a>
          </div>
        </div>

        <p className="relative z-20 mt-5 w-full text-center font-['Press_Start_2P'] text-[20px] uppercase leading-[1.3] tracking-[0.08em] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)] sm:text-[24px] md:absolute md:left-1/2 md:top-10 md:mt-0 md:w-[min(980px,calc(100%-420px))] md:-translate-x-1/2 md:text-center md:text-[36px] md:tracking-[0.10em] lg:text-[46px] xl:text-[56px]">
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
