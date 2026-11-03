"use client";

import { useEffect, useState } from "react";

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

export function useGraphicsPreferences() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [useLowPowerGraphics, setUseLowPowerGraphics] = useState(false);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const navigatorHints = navigator as NavigatorWithHints;

    const update = () => {
      const reducedMotion = reducedMotionQuery.matches;
      setPrefersReducedMotion(reducedMotion);
      setUseLowPowerGraphics(
        reducedMotion ||
          coarsePointerQuery.matches ||
          Boolean(navigatorHints.connection?.saveData) ||
          (navigatorHints.deviceMemory !== undefined && navigatorHints.deviceMemory <= 4)
      );
    };

    update();
    reducedMotionQuery.addEventListener("change", update);
    coarsePointerQuery.addEventListener("change", update);

    return () => {
      reducedMotionQuery.removeEventListener("change", update);
      coarsePointerQuery.removeEventListener("change", update);
    };
  }, []);

  return { prefersReducedMotion, useLowPowerGraphics };
}
