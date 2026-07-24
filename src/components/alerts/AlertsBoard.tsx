"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import type { Incident, IncidentStatus, Vessel, Zone } from "@/lib/types";
import { IncidentQueueRow } from "@/components/incident/IncidentQueueRow";
import { IncidentDrawer } from "@/components/incident/IncidentDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDispatchStore, effectiveStatus } from "@/lib/store/dispatch";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { EvidenceDossierModal } from "./EvidenceDossierModal";
import { sonarAudio } from "@/lib/sonar-audio";

type Tab = "all" | IncidentStatus;
const TABS: { v: Tab; label: string }[] = [
  { v: "all", label: "All" },
  { v: "new", label: "New" },
  { v: "assigned", label: "Assigned" },
  { v: "resolved", label: "Resolved" },
];

/** The triage & dispatch board. Effective status is base ⊕ client override, so
 *  dispatching a vessel in the drawer live-moves a row between the tabs. */
export function AlertsBoard({
  incidents,
  zones,
  vessels,
}: {
  incidents: Incident[];
  zones: Zone[];
  vessels: Vessel[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const overrides = useDispatchStore((s) => s.overrides);
  const [openId, setOpenId] = useState<string | null>(null);
  const [dossierIncident, setDossierIncident] = useState<Incident | null>(null);

  const tab = (params.get("status") as Tab) ?? "all";
  const zoneById = useMemo(() => new Map(zones.map((z) => [z.id, z])), [zones]);

  const withStatus = useMemo(
    () =>
      incidents.map((inc) => ({
        inc,
        status: effectiveStatus(inc.status, overrides[inc.id]),
      })),
    [incidents, overrides],
  );

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: withStatus.length, new: 0, assigned: 0, resolved: 0 };
    for (const w of withStatus) c[w.status]++;
    return c;
  }, [withStatus]);

  const visible = withStatus.filter((w) => tab === "all" || w.status === tab);
  const selected = incidents.find((i) => i.id === openId) ?? null;

  function setTab(v: Tab) {
    const next = new URLSearchParams(params.toString());
    if (v === "all") next.delete("status");
    else next.set("status", v);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Filter by status"
          className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-line bg-surface-2 p-0.5"
        >
          {TABS.map((t) => (
            <button
              key={t.v}
              role="tab"
              aria-selected={tab === t.v}
              onClick={() => setTab(t.v)}
              className={cn(
                "flex items-center gap-1.5 rounded-[4px] px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow",
                tab === t.v ? "bg-surface-3 text-text" : "text-text-muted hover:text-text",
              )}
            >
              {t.label}
              <span className="tabular rounded-full bg-abyss/60 px-1.5 text-xs text-text-dim">
                {counts[t.v]}
              </span>
            </button>
          ))}
        </div>

        <Link
          href="/about"
          className="inline-flex items-center gap-1 text-xs text-text-dim hover:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
        >
          <Info size={12} /> Dispatch is client-only — resets on reload
        </Link>
      </div>

      <div className="flex flex-row overflow-hidden w-full min-h-[500px]">
        {/* Left Side: Main List (Adjusts width dynamically as sidebar is pulled/resized) */}
        <div className="flex-1 min-w-0 pr-2 overflow-y-auto transition-all duration-150">
          {visible.length === 0 ? (
            <EmptyState
              title={`No ${tab === "all" ? "" : tab} incidents`}
              hint="Nothing in this bucket right now."
            />
          ) : (
            <ul className="flex flex-col gap-1.5">
              {visible.map(({ inc }, i) => (
                <li key={inc.id}>
                  <IncidentQueueRow
                    incident={inc}
                    zoneName={zoneById.get(inc.zoneId)?.name ?? inc.zoneId}
                    rank={i + 1}
                    showThumb
                    active={inc.id === openId}
                    onSelect={(id) => {
                      sonarAudio.playClickBlip();
                      setOpenId(id);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <IncidentDrawer
          incident={selected}
          zone={selected ? zoneById.get(selected.zoneId) : undefined}
          vessels={vessels}
          open={openId !== null}
          onOpenChange={(o) => !o && setOpenId(null)}
        />
      </div>

      <EvidenceDossierModal
        open={dossierIncident !== null}
        onOpenChange={(o) => !o && setDossierIncident(null)}
        incident={dossierIncident}
        zone={dossierIncident ? zoneById.get(dossierIncident.zoneId) ?? null : null}
        vessel={dossierIncident ? vessels.find((v) => v.id === overrides[dossierIncident.id]?.vesselId) ?? null : null}
      />
    </div>
  );
}
