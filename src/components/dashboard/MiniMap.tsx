"use client";

import Link from "next/link";
import { Maximize2 } from "lucide-react";
import type { Incident, Zone } from "@/lib/types";
import { ThreatMap } from "@/components/map/ThreatMap";
import { LiveDot } from "@/components/ui/LiveDot";

/** Non-interactive threat-map preview for the dashboard. Click → full /map. */
export function MiniMap({ incidents, zones }: { incidents: Incident[]; zones: Zone[] }) {
  return (
    <div className="relative h-full min-h-[320px] overflow-hidden rounded-[var(--radius-md)] border border-line">
      <ThreatMap incidents={incidents} zones={zones} interactive={false} />
      {/* overlay: cover the map so it reads as a preview, and links to /map */}
      <Link
        href="/map"
        className="group absolute inset-0 z-[500] flex items-end justify-between gap-2 bg-gradient-to-t from-abyss/70 to-transparent p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
        aria-label="Open the full live threat map"
      >
        <span className="rounded-full border border-line-bright bg-surface/80 px-2.5 py-1 backdrop-blur-sm">
          <LiveDot label="Live threat map" />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-bright bg-surface/80 px-2.5 py-1 text-xs text-text-muted backdrop-blur-sm group-hover:text-text">
          <Maximize2 size={13} /> Open map
        </span>
      </Link>
    </div>
  );
}
