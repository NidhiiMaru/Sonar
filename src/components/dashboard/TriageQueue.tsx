"use client";

import { useState } from "react";
import type { Incident, Vessel, Zone } from "@/lib/types";
import { IncidentQueueRow } from "@/components/incident/IncidentQueueRow";
import { IncidentDrawer } from "@/components/incident/IncidentDrawer";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/EmptyState";
import { RankingPopover } from "./RankingPopover";

/** The AI triage queue: ranked rows that open the shared incident drawer. */
export function TriageQueue({
  incidents,
  zones,
  vessels,
  title = "AI triage queue",
}: {
  incidents: Incident[];
  zones: Zone[];
  vessels: Vessel[];
  title?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const zoneById = new Map(zones.map((z) => [z.id, z]));
  const selected = incidents.find((i) => i.id === openId) ?? null;

  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader title={title} action={<RankingPopover />} />
      <div className="flex flex-col gap-0.5 p-2">
        {incidents.length === 0 ? (
          <EmptyState title="Queue clear" hint="No incidents match the current view." className="border-0" />
        ) : (
          incidents.map((inc, i) => (
            <IncidentQueueRow
              key={inc.id}
              incident={inc}
              zoneName={zoneById.get(inc.zoneId)?.name ?? inc.zoneId}
              rank={i + 1}
              active={inc.id === openId}
              onSelect={setOpenId}
            />
          ))
        )}
      </div>

      <IncidentDrawer
        incident={selected}
        zone={selected ? zoneById.get(selected.zoneId) : undefined}
        vessels={vessels}
        open={openId !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
      />
    </Panel>
  );
}
