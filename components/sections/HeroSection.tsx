"use client";

import { FlowText, type FlowObstacle } from "@/components/pretext/FlowText";
import {
  heroCopy,
  heroEssayParagraphs,
  heroRightColumnLead,
  heroTitleLines
} from "@/lib/content";
import Image from "next/image";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function heroEssayStyleForWidth(width: number) {
  if (width < 640) {
    return {
      fontFamily:
        "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", Palatino, Georgia, serif",
      fontWeight: 400,
      fontSize: 20,
      lineHeight: 31,
      letterSpacing: 0.08
    };
  }
  if (width < 1024) {
    return {
      fontFamily:
        "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", Palatino, Georgia, serif",
      fontWeight: 400,
      fontSize: 24,
      lineHeight: 37,
      letterSpacing: 0.09
    };
  }
  return {
    fontFamily:
      "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", Palatino, Georgia, serif",
    fontWeight: 400,
    fontSize: 39,
    lineHeight: 58,
    letterSpacing: 0.1
  };
}

function heroEssayObstacles(width: number): FlowObstacle[] {
  if (width < 1024) {
    return [];
  }

  const crestLeft = 8;
  const crestTop = 350;
  const crestWidth = width >= 1280 ? 220 : 178;
  const crestHeight = Math.round(crestWidth * 1.5);
  const sunSize = clamp(width * 0.16, 184, 256);
  const sunCx = width - (sunSize * 0.5 + 30);

  return [
    {
      kind: "rect",
      top: crestTop,
      bottom: crestTop + crestHeight,
      left: crestLeft,
      right: crestLeft + crestWidth,
      padding: 38
    },
    {
      kind: "circle",
      cx: sunCx,
      cy: sunSize * 0.5 + 16,
      radius: sunSize * 0.48,
      padding: 22
    }
  ];
}

function SunburstMark() {
  const rays = Array.from({ length: 14 }, (_, index) => index);

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      {rays.map((ray) => {
        const rotation = (360 / rays.length) * ray;
        return (
          <rect
            key={rotation}
            x="93"
            y="7"
            width="14"
            height="80"
            rx="7"
            fill="#d87a58"
            transform={`rotate(${rotation} 100 100)`}
          />
        );
      })}
      <circle cx="100" cy="100" r="35" fill="#d87a58" />
    </svg>
  );
}

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden section-rule">
      <div className="mx-auto w-full max-w-[1500px] px-6 pb-16 pt-10 md:px-10 md:pb-20 md:pt-12">
        <div className="flex justify-center">
          <p className="rounded-full bg-[#1f1f1d] px-6 py-2 text-[11px] tracking-[0.04em] text-white md:text-xs">
            Everything laid out in JS with Pretext. Resize horizontally and vertically, then explore.
          </p>
        </div>

        <div className="mt-10 grid gap-10 xl:grid-cols-[1.06fr_0.94fr] xl:gap-14">
          <div>
            <h1 className="editorial-display text-[3.1rem] font-medium uppercase leading-[0.88] tracking-[-0.02em] text-[#111] md:text-[5.2rem] xl:text-[7.65rem]">
              {heroTitleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="editorial-kicker mt-5 text-[11px] text-mist md:text-xs">{heroCopy.kicker}</p>
          </div>

          <div className="max-w-[44rem] xl:pt-2">
            {heroRightColumnLead.map((paragraph) => (
              <p
                key={paragraph}
                className="editorial-display mb-5 text-[1.5rem] leading-[1.38] text-[#181818] md:text-[2rem] md:leading-[1.36]"
              >
                {paragraph}
              </p>
            ))}
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-graphite md:text-lg">
              {heroCopy.subline}
            </p>
          </div>
        </div>

        <div className="relative mt-10 md:mt-12">
          <a
            href="https://www.wisc.edu"
            target="_blank"
            rel="noreferrer"
            className="absolute left-2 top-[350px] z-10 hidden transition-transform hover:scale-[1.03] lg:block"
            aria-label="University of Wisconsin-Madison"
          >
            <Image
              src="/images/uw-madison-crest.png"
              alt="University of Wisconsin-Madison crest"
              width={220}
              height={330}
              className="h-auto w-[178px] xl:w-[220px]"
              priority
            />
          </a>

          <a
            href="https://github.com/chenglou/pretext"
            target="_blank"
            rel="noreferrer"
            className="absolute right-2 top-[-20px] z-10 hidden h-[184px] w-[184px] transition-transform hover:scale-[1.03] lg:block xl:h-[236px] xl:w-[236px]"
            aria-label="Pretext GitHub repository"
          >
            <SunburstMark />
          </a>

          <FlowText
            className="w-full min-h-[420px]"
            paragraphs={heroEssayParagraphs}
            paragraphGap={28}
            minLineWidth={250}
            styleForWidth={heroEssayStyleForWidth}
            obstacles={heroEssayObstacles}
          />
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-7">
          <a
            href="#bio"
            className="text-xs uppercase tracking-[0.14em] text-mist transition-colors hover:text-ink"
          >
            Continue to profile
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 border-b border-black pb-1 text-xs uppercase tracking-[0.14em] text-ink transition-opacity hover:opacity-60"
          >
            Start a conversation
          </a>
        </div>

        <a
          href="https://www.wisc.edu"
          target="_blank"
          rel="noreferrer"
          className="mx-auto mt-10 block w-fit lg:hidden"
          aria-label="University of Wisconsin-Madison"
        >
          <Image
            src="/images/uw-madison-crest.png"
            alt="University of Wisconsin-Madison crest"
            width={160}
            height={240}
            className="h-auto w-[120px]"
          />
        </a>
      </div>
    </section>
  );
}

