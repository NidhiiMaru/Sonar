"use client";

import { Waves } from "lucide-react";

interface Props {
  depthRange: [number, number];
}

const ZONES = [
  { name: "Sunlight (0–200m)", min: 0, max: 200, color: "bg-glow" },
  { name: "Twilight (200–1,000m)", min: 200, max: 1000, color: "bg-bio" },
  { name: "Midnight (1,000–4,000m)", min: 1000, max: 4000, color: "bg-plum" },
  { name: "Abyssal (4,000m+)", min: 4000, max: 11000, color: "bg-alert" },
];

export function SpeciesDepthBar({ depthRange }: Props) {
  const [minDepth, maxDepth] = depthRange;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 font-mono font-semibold uppercase tracking-wider text-text-dim">
          <Waves size={13} className="text-glow" />
          Habitat Depth Profile
        </span>
        <span className="tabular font-mono text-xs font-bold text-glow">
          {minDepth}m – {maxDepth}m
        </span>
      </div>

      {/* Visual horizontal depth bar with ocean zone fills */}
      <div className="relative h-6 w-full overflow-hidden rounded-md border border-line bg-abyss p-0.5 flex gap-0.5">
        {ZONES.map((zone) => {
          // Check overlap
          const overlaps = maxDepth >= zone.min && minDepth <= zone.max;
          return (
            <div
              key={zone.name}
              className={`relative flex-1 h-full rounded-[2px] transition-all ${
                overlaps ? `${zone.color}/40 border border-glow/60 shadow-[0_0_8px_rgba(34,211,238,0.2)]` : "bg-surface/40 opacity-30"
              }`}
              title={`${zone.name}: ${overlaps ? "Habitat Occupied" : "Outside Range"}`}
            >
              {overlaps && (
                <div className={`h-full w-full ${zone.color} opacity-80 animate-pulse`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-4 text-center text-[10px] font-mono text-text-dim">
        <span>0m</span>
        <span>200m</span>
        <span>1,000m</span>
        <span>4,000m+</span>
      </div>
    </div>
  );
}
