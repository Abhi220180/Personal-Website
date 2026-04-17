"use client";

import { LazyIcoSphereEmbed } from "@/components/three/LazyIcoSphereEmbed";
import { HoverNodeDetailsPanel } from "@/components/ui/HoverNodeDetailsPanel";
import type { SphereNode } from "@/lib/types";
import { useState } from "react";

interface InteractiveNodeExplorerProps {
  nodes: SphereNode[];
  panelHeading: string;
}

export function InteractiveNodeExplorer({
  nodes,
  panelHeading
}: InteractiveNodeExplorerProps) {
  const [hoveredNode, setHoveredNode] = useState<SphereNode | null>(null);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
      <div className="mx-auto aspect-square w-full max-w-[560px] xl:mx-0">
        <LazyIcoSphereEmbed nodes={nodes} onHoverNodeChange={setHoveredNode} />
      </div>

      {hoveredNode ? (
        <div className="xl:pt-2">
          <HoverNodeDetailsPanel node={hoveredNode} heading={panelHeading} />
        </div>
      ) : null}
    </div>
  );
}
