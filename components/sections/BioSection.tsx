"use client";

import { FlowText, type FlowObstacle } from "@/components/pretext/FlowText";
import { bioParagraphs, sphereNodes } from "@/lib/content";
import dynamic from "next/dynamic";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

const IcoSphereEmbed = dynamic(
  () => import("@/components/three/IcoSphereEmbed").then((module) => module.IcoSphereEmbed),
  {
    ssr: false,
    loading: () => <div className="h-full w-full rounded-full border border-black/10 bg-white/50 dark:border-white/20 dark:bg-white/5" />
  }
);

type SphereLayout = {
  isDesktop: boolean;
  size: number;
  left: number;
  top: number;
};

type Point = {
  x: number;
  y: number;
};

type DragSession = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

type DragBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getSphereLayout(width: number): SphereLayout {
  const isDesktop = width >= 940;
  if (!isDesktop) {
    const size = clamp(width * 0.8, 220, 320);
    return {
      isDesktop,
      size,
      left: 0,
      top: 0
    };
  }

  const size = clamp(width * 0.33, 250, 360);
  const left = width - size - clamp(width * 0.05, 28, 54);
  const top = 190;
  return {
    isDesktop,
    size,
    left,
    top
  };
}

function bioStyleForWidth(width: number) {
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
  if (width < 940) {
    return {
      fontFamily:
        "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", Palatino, Georgia, serif",
      fontWeight: 400,
      fontSize: 24,
      lineHeight: 36,
      letterSpacing: 0.09
    };
  }
  return {
    fontFamily:
      "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", Palatino, Georgia, serif",
    fontWeight: 400,
    fontSize: 26,
    lineHeight: 39,
    letterSpacing: 0.1
  };
}

export function BioSection() {
  const [flowLayout, setFlowLayout] = useState({ width: 0, height: 0 });
  const [tilePosition, setTilePosition] = useState<Point | null>(null);
  const [isDraggingTile, setIsDraggingTile] = useState(false);
  const dragRef = useRef<DragSession | null>(null);
  const dragHintPathId = useId();

  const sphere = useMemo(() => getSphereLayout(flowLayout.width), [flowLayout.width]);
  const ringThickness = useMemo(() => {
    if (!sphere.isDesktop) {
      return 0;
    }
    return clamp(Math.round(sphere.size * 0.09), 20, 28);
  }, [sphere.isDesktop, sphere.size]);
  const shellDiameter = useMemo(() => sphere.size + ringThickness * 2, [ringThickness, sphere.size]);
  const ringLabelRadius = useMemo(() => {
    if (shellDiameter <= 0) {
      return 44;
    }
    const ringThicknessPct = (ringThickness / shellDiameter) * 100;
    return 50 - ringThicknessPct * 0.5;
  }, [ringThickness, shellDiameter]);
  const ringLabelCircumference = useMemo(
    () => 2 * Math.PI * ringLabelRadius,
    [ringLabelRadius]
  );
  const ringLabelText =
    "CLICK OUTER RING TO DRAG SPHERE * CLICK NODE TO SEE CONTENT * CLICK OUTER RING TO DRAG SPHERE * CLICK NODE TO SEE CONTENT *";
  const defaultShellPosition = useMemo<Point>(
    () => ({
      x: sphere.left - ringThickness,
      y: sphere.top - ringThickness
    }),
    [ringThickness, sphere.left, sphere.top]
  );

  const dragBounds = useMemo<DragBounds | null>(() => {
    if (!sphere.isDesktop) {
      return null;
    }
    const minX = 20;
    const maxX = Math.max(minX, flowLayout.width - shellDiameter - 20);
    const minY = 120;
    const baseHeight = Math.max(flowLayout.height, 580);
    const maxY = Math.max(minY, baseHeight - shellDiameter - 24);
    return { minX, maxX, minY, maxY };
  }, [flowLayout.height, flowLayout.width, shellDiameter, sphere.isDesktop]);

  useEffect(() => {
    if (!sphere.isDesktop || !dragBounds) {
      setTilePosition(null);
      return;
    }
    setTilePosition((previous) => {
      const fallback = defaultShellPosition;
      const current = previous ?? fallback;
      return {
        x: clamp(current.x, dragBounds.minX, dragBounds.maxX),
        y: clamp(current.y, dragBounds.minY, dragBounds.maxY)
      };
    });
  }, [defaultShellPosition, dragBounds, sphere.isDesktop]);

  const activeTilePosition = useMemo<Point>(() => {
    if (sphere.isDesktop) {
      if (tilePosition) {
        return tilePosition;
      }
      return defaultShellPosition;
    }
    return { x: 0, y: 0 };
  }, [defaultShellPosition, sphere.isDesktop, tilePosition]);

  const textObstacles = useMemo<FlowObstacle[]>(() => {
    if (!sphere.isDesktop) {
      return [];
    }
    return [
      {
        kind: "circle",
        cx: activeTilePosition.x + shellDiameter * 0.5,
        cy: activeTilePosition.y + shellDiameter * 0.5,
        radius: shellDiameter * 0.5,
        padding: 18
      }
    ];
  }, [activeTilePosition.x, activeTilePosition.y, shellDiameter, sphere.isDesktop]);

  const desktopWrapHeight = useMemo(() => {
    if (!sphere.isDesktop) {
      return flowLayout.height;
    }
    const tileBottom = activeTilePosition.y + shellDiameter + 24;
    return Math.max(flowLayout.height, tileBottom);
  }, [activeTilePosition.y, flowLayout.height, shellDiameter, sphere.isDesktop]);

  const handleDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!sphere.isDesktop || !dragBounds) {
      return;
    }
    event.preventDefault();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: activeTilePosition.x,
      originY: activeTilePosition.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDraggingTile(true);
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !dragBounds) {
      return;
    }
    if (event.pointerId !== drag.pointerId) {
      return;
    }
    event.preventDefault();
    const nextX = clamp(drag.originX + (event.clientX - drag.startX), dragBounds.minX, dragBounds.maxX);
    const nextY = clamp(drag.originY + (event.clientY - drag.startY), dragBounds.minY, dragBounds.maxY);
    setTilePosition({ x: nextX, y: nextY });
  };

  const handleDragEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    dragRef.current = null;
    setIsDraggingTile(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section id="bio" className="section-rule">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 md:px-10 md:py-28">
        <div className="mb-10">
          <p className="editorial-kicker text-xs text-mist">Profile / Scrolling Bio</p>
        </div>

        <div className="relative" style={sphere.isDesktop ? { minHeight: `${desktopWrapHeight}px` } : undefined}>
          <FlowText
            className="w-full"
            paragraphs={bioParagraphs}
            paragraphGap={30}
            minLineWidth={210}
            fillSplitSpans
            styleForWidth={bioStyleForWidth}
            obstacles={textObstacles}
            onLayout={setFlowLayout}
          />

          {sphere.isDesktop ? (
            <div
              className={`absolute ${isDraggingTile ? "z-20" : "z-10"}`}
              style={{
                top: `${activeTilePosition.y}px`,
                left: `${activeTilePosition.x}px`,
                width: `${shellDiameter}px`,
                height: `${shellDiameter}px`
              }}
            >
              <div
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
                className={`relative h-full w-full rounded-full border border-black/20 bg-white/70 shadow-soft-line dark:border-white/25 dark:bg-black/25 ${
                  isDraggingTile ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={{ touchAction: "none", padding: `${ringThickness}px` }}
                aria-label="Drag sphere by the outer ring"
              >
                <svg className="pointer-events-none absolute inset-0 h-full w-full text-mist" viewBox="0 0 100 100" aria-hidden>
                  <defs>
                    <path
                      id={dragHintPathId}
                      d={`M 50,50 m -${ringLabelRadius},0 a ${ringLabelRadius},${ringLabelRadius} 0 1,1 ${
                        ringLabelRadius * 2
                      },0 a ${ringLabelRadius},${ringLabelRadius} 0 1,1 -${ringLabelRadius * 2},0`}
                    />
                  </defs>
                  <text fill="currentColor" fontSize="2.8" letterSpacing="0.65">
                    <textPath
                      href={`#${dragHintPathId}`}
                      startOffset="0%"
                      textLength={ringLabelCircumference}
                      lengthAdjust="spacingAndGlyphs"
                    >
                      {ringLabelText}
                    </textPath>
                  </text>
                </svg>
                <div
                  className="relative h-full w-full"
                  onPointerDown={(event) => event.stopPropagation()}
                  onPointerMove={(event) => event.stopPropagation()}
                  onPointerUp={(event) => event.stopPropagation()}
                  onPointerCancel={(event) => event.stopPropagation()}
                >
                  <IcoSphereEmbed nodes={sphereNodes} />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {!sphere.isDesktop ? (
          <div className="mx-auto mt-14 h-[340px] w-full max-w-[360px]">
            <IcoSphereEmbed nodes={sphereNodes} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
