import type { SphereNode } from "@/lib/types";

interface HoverNodeDetailsPanelProps {
  node: SphereNode;
  heading: string;
}

export function HoverNodeDetailsPanel({ node, heading }: HoverNodeDetailsPanelProps) {
  return (
    <aside className="w-full border border-white/30 bg-black/35 p-5 backdrop-blur-sm md:p-6">
      <p className="font-['Press_Start_2P'] text-[10px] uppercase tracking-[0.09em] text-white/90">{heading}</p>

      <div className="mt-4 space-y-4">
        <h4 className="font-['Press_Start_2P'] text-xs uppercase tracking-[0.08em] text-white">{node.label}</h4>
        {node.roleName ? (
          <p className="text-[11px] uppercase tracking-[0.11em] text-white/75">{node.roleName}</p>
        ) : null}
        <p className="text-sm leading-7 text-white/85 md:text-base md:leading-8">
          {node.summary ?? "Add a short project/experience description here."}
        </p>

        {node.highlights && node.highlights.length > 0 ? (
          <ul className="space-y-2 text-sm text-white/85 md:text-base">
            {node.highlights.slice(0, 3).map((item) => (
              <li key={item} className="leading-7 md:leading-8">
                <span className="mr-2 text-white/70">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </aside>
  );
}
