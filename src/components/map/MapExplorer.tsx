"use client";

import { useState } from "react";
import type { Incident, Zone, Vessel } from "@/lib/types";
import { ThreatMap } from "./ThreatMap";
import { IncidentDrawer } from "@/components/incident/IncidentDrawer";
import { SeverityDot } from "@/components/ui/SeverityBadge";
import { SEVERITY_META } from "@/lib/ui-meta";
import type { Severity } from "@/lib/types";

/** Interactive map surface + shared incident drawer. Selection is client state;
 *  the accessible table (rendered server-side below the map) mirrors the data. */
export function MapExplorer({
  incidents,
  zones,
  vessels,
  tracks,
}: {
  incidents: Incident[];
  zones: Zone[];
  vessels: Vessel[];
  tracks?: [number, number][][];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = incidents.find((i) => i.id === selectedId) ?? null;
  const zoneById = new Map(zones.map((z) => [z.id, z]));

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-line">
      <div className="h-[60vh] min-h-[420px] w-full">
        <ThreatMap
          incidents={incidents}
          zones={zones}
          tracks={tracks}
          selectedId={selectedId}
          onSelect={setSelectedId}
          interactive
        />
      </div>

      {/* Legend — shapes + labels, greyscale-safe */}
      <div className="pointer-events-none absolute left-3 top-3 z-[500] flex flex-col gap-1.5 rounded-[var(--radius-sm)] border border-line-bright bg-surface/85 p-2.5 text-xs backdrop-blur-sm">
        <span className="font-semibold uppercase tracking-wide text-text-dim">Severity</span>
        {(["high", "medium", "low"] as Severity[]).map((s) => (
          <span key={s} className="flex items-center gap-2 text-text-muted">
            <SeverityDot shape={SEVERITY_META[s].shape} className={SEVERITY_META[s].dot} size={11} />
            {SEVERITY_META[s].label}
          </span>
        ))}
      </div>

      <IncidentDrawer
        incident={selected}
        zone={selected ? zoneById.get(selected.zoneId) : undefined}
        vessels={vessels}
        open={selectedId !== null}
        onOpenChange={(o) => !o && setSelectedId(null)}
      />
    </div>
  );
}
