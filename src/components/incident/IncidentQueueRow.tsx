"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Incident } from "@/lib/types";
import { INCIDENT_TYPE_META } from "@/lib/ui-meta";
import { SeverityDot } from "@/components/ui/SeverityBadge";
import { ConfidenceChip } from "@/components/ui/ConfidenceChip";
import { SEVERITY_META } from "@/lib/ui-meta";
import { timeAgo, cn } from "@/lib/utils";
import { getImage } from "@/lib/images";

/**
 * One ranked incident row — used by the dashboard triage queue, the alerts
 * queue and the landing proof strip. `onSelect` opens the drawer; without it
 * the row is a static readout (landing).
 */
export function IncidentQueueRow({
  incident,
  zoneName,
  rank,
  onSelect,
  showThumb = false,
  active = false,
}: {
  incident: Incident;
  zoneName: string;
  rank?: number;
  onSelect?: (id: string) => void;
  showThumb?: boolean;
  active?: boolean;
}) {
  const type = INCIDENT_TYPE_META[incident.type];
  const sev = SEVERITY_META[incident.severity];
  const img = showThumb ? getImage(incident.imageKey) : null;

  const inner = (
    <>
      {rank !== undefined && (
        <span className="tabular w-5 shrink-0 text-center text-xs font-semibold text-text-dim">
          {rank}
        </span>
      )}
      {img && (
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-abyss">
          <Image src={img.src} alt="" fill sizes="36px" className="object-cover" />
        </span>
      )}
      <SeverityDot shape={sev.shape} className={cn(sev.dot, "shrink-0")} size={12} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-text">{type.label}</span>
        <span className="truncate text-xs text-text-dim">
          {zoneName} · {timeAgo(incident.detectedAt)}
        </span>
      </span>
      <ConfidenceChip
        value={incident.ai.confidence}
        modelVersion={incident.ai.modelVersion}
        compact
      />
      {onSelect && <ChevronRight size={15} className="shrink-0 text-text-dim" aria-hidden="true" />}
    </>
  );

  const base =
    "flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] border px-2.5 py-2 text-left transition-colors";
  const state = active
    ? "border-glow/40 bg-surface-2"
    : "border-transparent hover:border-line hover:bg-surface-2";

  if (!onSelect) {
    return <div className={cn(base, "border-transparent", sev.soft, "bg-opacity-40")}>{inner}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(incident.id)}
      className={cn(
        base,
        state,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow",
      )}
    >
      {inner}
    </button>
  );
}
