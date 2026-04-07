"use client";

import { layoutNextLine, prepareWithSegments } from "@chenglou/pretext";
import { useEffect, useMemo, useRef, useState } from "react";

type FlowRectObstacle = {
  kind: "rect";
  top: number;
  bottom: number;
  left: number;
  right: number;
  padding?: number;
};

type FlowCircleObstacle = {
  kind: "circle";
  cx: number;
  cy: number;
  radius: number;
  padding?: number;
};

export type FlowObstacle = FlowRectObstacle | FlowCircleObstacle;

type Interval = {
  start: number;
  end: number;
};

type FlowSpan = {
  x: number;
  width: number;
};

type FlowLine = {
  id: string;
  text: string;
  x: number;
  y: number;
};

type FlowStyle = {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
};

type LayoutResult = {
  lines: FlowLine[];
  width: number;
  height: number;
  style: FlowStyle;
};

interface FlowTextProps {
  paragraphs: string[];
  className?: string;
  paragraphGap?: number;
  minLineWidth?: number;
  alternateSidesAroundObstacles?: boolean;
  fillSplitSpans?: boolean;
  styleForWidth?: (width: number) => FlowStyle;
  obstacles?: FlowObstacle[] | ((width: number) => FlowObstacle[]);
  onLayout?: (layout: { width: number; height: number }) => void;
}

const defaultStyleForWidth = (width: number): FlowStyle => ({
  fontFamily:
    "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", Palatino, Georgia, serif",
  fontWeight: 400,
  fontSize: width < 768 ? 21 : 26,
  lineHeight: width < 768 ? 32 : 38,
  letterSpacing: 0.1
});

function subtractInterval(intervals: Interval[], cut: Interval): Interval[] {
  const next: Interval[] = [];
  for (const interval of intervals) {
    const overlaps = cut.start < interval.end && cut.end > interval.start;
    if (!overlaps) {
      next.push(interval);
      continue;
    }
    if (cut.start > interval.start) {
      next.push({ start: interval.start, end: Math.max(interval.start, cut.start) });
    }
    if (cut.end < interval.end) {
      next.push({ start: Math.min(cut.end, interval.end), end: interval.end });
    }
  }
  return next;
}

function getCutIntervalAtY(obstacle: FlowObstacle, y: number): Interval | null {
  if (obstacle.kind === "rect") {
    const pad = obstacle.padding ?? 0;
    const top = obstacle.top - pad;
    const bottom = obstacle.bottom + pad;
    if (y < top || y > bottom) {
      return null;
    }
    return {
      start: obstacle.left - pad,
      end: obstacle.right + pad
    };
  }

  const pad = obstacle.padding ?? 0;
  const dy = y - obstacle.cy;
  const radius = obstacle.radius + pad;
  if (Math.abs(dy) >= radius) {
    return null;
  }
  const dx = Math.sqrt(Math.max(radius * radius - dy * dy, 0));
  return {
    start: obstacle.cx - dx,
    end: obstacle.cx + dx
  };
}

function computeLineSpans(
  width: number,
  y: number,
  obstacles: FlowObstacle[],
  minLineWidth: number,
  alternateSidesAroundObstacles: boolean,
  fillSplitSpans: boolean,
  lineIndex: number
): FlowSpan[] {
  let intervals: Interval[] = [{ start: 0, end: width }];

  for (const obstacle of obstacles) {
    const cut = getCutIntervalAtY(obstacle, y);
    if (cut === null) {
      continue;
    }
    intervals = subtractInterval(intervals, cut);
    if (intervals.length === 0) {
      break;
    }
  }

  if (intervals.length === 0) {
    return [{ x: 0, width }];
  }

  const usableIntervals = intervals
    .map((interval) => ({
      start: Math.max(0, interval.start),
      end: Math.min(width, interval.end)
    }))
    .filter((interval) => interval.end - interval.start >= minLineWidth);

  if (usableIntervals.length === 0) {
    return [{ x: 0, width }];
  }

  if (fillSplitSpans && usableIntervals.length >= 2) {
    return usableIntervals.map((interval) => ({
      x: interval.start,
      width: interval.end - interval.start
    }));
  }

  if (alternateSidesAroundObstacles && usableIntervals.length >= 2) {
    const left = usableIntervals[0];
    const right = usableIntervals[usableIntervals.length - 1];
    const hasSplitGap = right.start - left.end > 12;
    const leftWidth = left.end - left.start;
    const rightWidth = right.end - right.start;

    if (hasSplitGap && leftWidth >= minLineWidth && rightWidth >= minLineWidth) {
      const chosen = lineIndex % 2 === 0 ? left : right;
      return [
        {
          x: chosen.start,
          width: chosen.end - chosen.start
        }
      ];
    }
  }

  let widest = usableIntervals[0];
  for (const interval of usableIntervals) {
    if (interval.end - interval.start > widest.end - widest.start) {
      widest = interval;
    }
  }

  return [
    {
      x: widest.start,
      width: widest.end - widest.start
    }
  ];
}

export function FlowText({
  paragraphs,
  className = "",
  paragraphGap = 24,
  minLineWidth = 180,
  alternateSidesAroundObstacles = false,
  fillSplitSpans = false,
  styleForWidth = defaultStyleForWidth,
  obstacles,
  onLayout
}: FlowTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [fontEpoch, setFontEpoch] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }
    const update = () => {
      setWidth(Math.floor(node.getBoundingClientRect().width));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) {
      return;
    }

    const fontSet = document.fonts;
    let active = true;
    const bump = () => {
      if (active) {
        setFontEpoch((value) => value + 1);
      }
    };

    void fontSet.ready.then(bump).catch(() => undefined);

    const onLoadingDone = () => bump();
    const onLoadingError = () => bump();

    fontSet.addEventListener("loadingdone", onLoadingDone);
    fontSet.addEventListener("loadingerror", onLoadingError);

    return () => {
      active = false;
      fontSet.removeEventListener("loadingdone", onLoadingDone);
      fontSet.removeEventListener("loadingerror", onLoadingError);
    };
  }, []);

  const style = useMemo(() => styleForWidth(width), [styleForWidth, width]);

  const obstacleList = useMemo(() => {
    if (typeof obstacles === "function") {
      return obstacles(width);
    }
    return obstacles ?? [];
  }, [obstacles, width]);

  const preparedParagraphs = useMemo(() => {
    if (width === 0) {
      return [];
    }
    const fontString = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
    return paragraphs.map((paragraph) => prepareWithSegments(paragraph, fontString));
  }, [fontEpoch, paragraphs, style.fontFamily, style.fontSize, style.fontWeight, width]);

  const layout = useMemo<LayoutResult>(() => {
    if (width === 0 || preparedParagraphs.length === 0) {
      return {
        lines: [],
        width,
        height: 0,
        style
      };
    }

    const lines: FlowLine[] = [];
    let y = 0;
    const proseRightInset = 390;
    const maxLineWidth = Math.max(minLineWidth, width - proseRightInset);

    for (let paragraphIndex = 0; paragraphIndex < preparedParagraphs.length; paragraphIndex += 1) {
      let lineCursor = { segmentIndex: 0, graphemeIndex: 0 };
      let safetyCounter = 0;

      while (true) {
        const spans = computeLineSpans(
          width,
          y + style.lineHeight * 0.5,
          obstacleList,
          minLineWidth,
          alternateSidesAroundObstacles,
          fillSplitSpans,
          lines.length
        );

        let wroteAnyLine = false;
        let paragraphDone = false;

        for (let spanIndex = 0; spanIndex < spans.length; spanIndex += 1) {
          const span = spans[spanIndex];
          const targetWidth = Math.max(1, Math.min(span.width, maxLineWidth));
          const line = layoutNextLine(preparedParagraphs[paragraphIndex], lineCursor, targetWidth);
          if (line === null) {
            paragraphDone = true;
            break;
          }

          lines.push({
            id: `${paragraphIndex}-${safetyCounter}-${spanIndex}`,
            text: line.text,
            x: span.x,
            y
          });
          lineCursor = line.end;
          wroteAnyLine = true;
        }

        if (!wroteAnyLine) {
          break;
        }

        y += style.lineHeight;
        safetyCounter += 1;

        if (paragraphDone || safetyCounter > 1200) {
          break;
        }
      }

      if (paragraphIndex < preparedParagraphs.length - 1) {
        y += paragraphGap;
      }
    }

    return {
      lines,
      width,
      height: y + style.lineHeight * 0.25,
      style
    };
  }, [
    alternateSidesAroundObstacles,
    fillSplitSpans,
    minLineWidth,
    obstacleList,
    paragraphGap,
    preparedParagraphs,
    style,
    width
  ]);

  useEffect(() => {
    if (!onLayout) {
      return;
    }
    onLayout({ width: layout.width, height: layout.height });
  }, [layout.height, layout.width, onLayout]);

  return (
    <div ref={containerRef} className={className}>
      <div className="relative w-full" style={{ minHeight: layout.height || 10 }}>
        {layout.lines.map((line) => {
          const sharedStyle = {
            left: `${line.x}px`,
            top: `${line.y}px`,
            fontSize: `${layout.style.fontSize}px`,
            lineHeight: `${layout.style.lineHeight}px`,
            fontFamily: layout.style.fontFamily,
            fontWeight: layout.style.fontWeight,
            letterSpacing: `${layout.style.letterSpacing ?? 0}px`
          };

          return (
            <span key={line.id} className="absolute block whitespace-pre text-[color:var(--prose)]" style={sharedStyle}>
              {line.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
