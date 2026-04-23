"use client";

import { FlowText } from "@/components/pretext/FlowText";
import { LazyGlbOrbitCard } from "@/components/three/LazyGlbOrbitCard";
import { aboutParagraphs, modelPaths } from "@/lib/content";
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";

const customStyleForWidth = (width: number) => ({
  fontFamily: '"Press Start 2P", monospace',
  fontWeight: 400,
  fontSize: width < 768 ? 12 : 16,
  lineHeight: width < 768 ? 26 : 34,
  letterSpacing: 1.2
});

const RB_CARD_WIDTH = 320;
const RB_CARD_HEIGHT = 205;
const RB_SPAWN_PADDING = 20;

function getInitialRbPosition(width: number, height: number) {
  const x = Math.max(12, width - RB_CARD_WIDTH - RB_SPAWN_PADDING);
  const y = width >= 1024 ? -62 : width >= 768 ? -22 : Math.max(8, Math.min(height - RB_CARD_HEIGHT - 12, 20));
  return { x, y };
}

export function AboutSection() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  const activePointerIdRef = useRef<number | null>(null);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handleLayout = useCallback(({ width, height }: { width: number; height: number }) => {
    if (!isReady) {
      setPos(getInitialRbPosition(width, height));
      setIsReady(true);
    }
  }, [isReady]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (activePointerIdRef.current !== null) return;

    activePointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y
    };

    if (e.pointerType === "touch") {
      e.preventDefault();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({
      x: dragRef.current.initialX + dx,
      y: dragRef.current.initialY + dy
    });

    if (e.pointerType === "touch") {
      e.preventDefault();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    if (activePointerIdRef.current === e.pointerId) {
      activePointerIdRef.current = null;
    }
  };

  const obstacles = useMemo(
    () => [
      {
        kind: "rect" as const,
        left: pos.x + 108,
        top: pos.y + 84,
        right: pos.x + 224,
        bottom: pos.y + 136,
        padding: 8
      }
    ],
    [pos.x, pos.y]
  );

  return (
    <section id="who-i-am" className="section-rule">
      <div className="w-full px-6 py-24 md:px-10 md:py-28">
        <p className="font-['Press_Start_2P'] text-[10px] uppercase tracking-[0.09em] text-white/90">Who I Am</p>

        <div className="relative mt-10">
          <div className="flex justify-end xl:absolute xl:right-0 xl:-top-44">
            <LazyGlbOrbitCard
              modelPath={modelPaths.whoIAm}
              label="Cosmic Cove"
              showLabel={false}
              scale={1.02}
              className="h-[250px] w-[250px] sm:h-[290px] sm:w-[290px] lg:h-[320px] lg:w-[320px]"
            />
          </div>

          <div className="mt-8 w-full max-w-4xl xl:mt-0 xl:mx-auto">
            <p className="mb-4 font-['Press_Start_2P'] text-[10px] uppercase tracking-[0.09em] text-white/90">
              Drag The Red Bull Into Text
            </p>
            <div className="relative min-h-[500px]">
              <FlowText
                paragraphs={aboutParagraphs}
                obstacles={obstacles}
                onLayout={handleLayout}
                styleForWidth={customStyleForWidth}
                fillSplitSpans
                className="mx-auto w-full max-w-3xl text-white/90"
              />

              <div
                className="absolute z-10 h-[205px] w-[320px] cursor-move touch-none md:h-[230px] md:w-[360px]"
                style={{
                  left: pos.x,
                  top: pos.y,
                  opacity: isReady ? 1 : 0
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <div className="absolute inset-0 z-20" />
                <LazyGlbOrbitCard
                  modelPath={modelPaths.rb16}
                  label="RB16"
                  showLabel={false}
                  scale={0.84}
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
