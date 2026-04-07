"use client";

import { aboutParagraphs } from "@/lib/content";

import { FlowText } from "@/components/pretext/FlowText";
import dynamic from "next/dynamic";
import type React from "react";
import { useCallback, useRef, useState } from "react";

const GlbOrbitCard = dynamic(
  () => import("@/components/three/GlbOrbitCard").then((module) => module.GlbOrbitCard),
  { ssr: false }
);

const customStyleForWidth = (width: number) => ({
  fontFamily: '"Press Start 2P", monospace',
  fontWeight: 400,
  fontSize: width < 768 ? 12 : 16,
  lineHeight: width < 768 ? 26 : 34,
  letterSpacing: 1.2
});

export function AboutSection() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handleLayout = useCallback(({ width, height }: { width: number; height: number }) => {
    if (!isReady) {
      setPos({
        x: width / 2 - 140,
        y: height / 2 - 90
      });
      setIsReady(true);
    }
  }, [isReady]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({
      x: dragRef.current.initialX + dx,
      y: dragRef.current.initialY + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const obstacles = [
    {
      kind: "rect" as const,
      left: pos.x + 95,
      top: pos.y + 70,
      right: pos.x + 185,
      bottom: pos.y + 110,
      padding: 8
    }
  ];

  return (
    <section id="who-i-am" className="section-rule">
      <div className="w-full px-6 py-24 md:px-10 md:py-28">
        <p className="font-['Press_Start_2P'] text-[10px] uppercase tracking-[0.09em] text-white/90">Who I Am</p>

        <div className="relative mt-10">
          <div className="flex justify-end xl:absolute xl:right-0 xl:-top-44">
            <GlbOrbitCard
              modelPath="/models/cosmic-cove.glb"
              label="Cosmic Cove"
              showLabel={false}
              scale={1.02}
              className="h-[250px] w-[250px] sm:h-[290px] sm:w-[290px] lg:h-[320px] lg:w-[320px]"
            />
          </div>

          <div className="mt-8 xl:mt-0 xl:max-w-3xl">
            <div className="relative min-h-[500px]">
              <FlowText
                paragraphs={aboutParagraphs}
                obstacles={obstacles}
                onLayout={handleLayout}
                styleForWidth={customStyleForWidth}
                fillSplitSpans
                className="w-full text-white/90"
              />

              <div
                className="absolute z-10 w-[280px] h-[180px] cursor-move touch-none"
                style={{
                  left: pos.x,
                  top: pos.y,
                  opacity: isReady ? 1 : 0
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <div className="absolute inset-0 z-20" />
                <GlbOrbitCard
                  modelPath="/models/rb16.glb"
                  label="RB16"
                  showLabel={false}
                  scale={0.68}
                  autoRotateSpeed={0.18}
                  className="h-full w-full pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
