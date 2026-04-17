"use client";

import type { SphereNode } from "@/lib/types";
import dynamic from "next/dynamic";

const IcoSphereEmbed = dynamic(
  () => import("@/components/three/IcoSphereEmbed").then((module) => module.IcoSphereEmbed),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-full border border-white/30 bg-black/25 text-[10px] uppercase tracking-[0.08em] text-white/75">
        Loading Isosphere...
      </div>
    )
  }
);

interface LazyIcoSphereEmbedProps {
  nodes: SphereNode[];
  onHoverNodeChange?: (node: SphereNode | null) => void;
}

export function LazyIcoSphereEmbed({ nodes, onHoverNodeChange }: LazyIcoSphereEmbedProps) {
  return <IcoSphereEmbed nodes={nodes} onHoverNodeChange={onHoverNodeChange} />;
}
