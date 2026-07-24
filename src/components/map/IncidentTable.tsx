import type { Incident, Zone } from "@/lib/types";
import { SOURCE_LABEL } from "@/lib/types";
import { INCIDENT_TYPE_META } from "@/lib/ui-meta";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { ConfidenceChip } from "@/components/ui/ConfidenceChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCoords, formatDateTime, timeAgo } from "@/lib/utils";

/**
 * The accessible, crawlable equivalent of the map. Same
 * filtered incidents as the map above it — keyboard users, screen readers and
 * search crawlers all get the full content. Real <table> on md+, cards on mobile.
 */
export function IncidentTable({ incidents, zones }: { incidents: Incident[]; zones: Zone[] }) {
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? id;

  if (incidents.length === 0) {
    return (
      <EmptyState
        title="No incidents match these filters"
        hint="Try widening the severity, type, zone or time window."
      />
    );
  }

  return (
    <>
      {/* mobile cards */}
      <ul className="flex flex-col gap-2 md:hidden">
        {incidents.map((inc) => (
          <li key={inc.id} className="rounded-[var(--radius-md)] border border-line bg-surface p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="tabular text-xs text-text-dim">{inc.id}</span>
              <SeverityBadge level={inc.severity} />
            </div>
            <p className="mt-1 text-sm font-medium text-text">{INCIDENT_TYPE_META[inc.type].label}</p>
            <p className="text-xs text-text-dim">
              {zoneName(inc.zoneId)} · {formatCoords(inc.coords)} · {timeAgo(inc.detectedAt)}
            </p>
            <div className="mt-2">
              <ConfidenceChip value={inc.ai.confidence} modelVersion={inc.ai.modelVersion} compact />
            </div>
          </li>
        ))}
      </ul>

      {/* desktop table */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Filtered deep-ocean incidents — the accessible equivalent of the map above.
          </caption>
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-text-dim">
              <th scope="col" className="py-2 pr-3 font-medium">ID</th>
              <th scope="col" className="py-2 pr-3 font-medium">Type</th>
              <th scope="col" className="py-2 pr-3 font-medium">Severity</th>
              <th scope="col" className="py-2 pr-3 font-medium">Zone</th>
              <th scope="col" className="py-2 pr-3 font-medium">Confidence</th>
              <th scope="col" className="py-2 pr-3 font-medium">Source</th>
              <th scope="col" className="py-2 pr-3 font-medium">Coordinates</th>
              <th scope="col" className="py-2 font-medium">Detected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {incidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-surface-2">
                <th scope="row" className="tabular py-2 pr-3 text-left font-normal text-text-dim">
                  {inc.id}
                </th>
                <td className="py-2 pr-3 text-text">{INCIDENT_TYPE_META[inc.type].label}</td>
                <td className="py-2 pr-3"><SeverityBadge level={inc.severity} /></td>
                <td className="py-2 pr-3 text-text-muted">{zoneName(inc.zoneId)}</td>
                <td className="py-2 pr-3"><ConfidenceChip value={inc.ai.confidence} modelVersion={inc.ai.modelVersion} compact /></td>
                <td className="py-2 pr-3 text-text-muted">{SOURCE_LABEL[inc.source]}</td>
                <td className="tabular py-2 pr-3 text-text-muted">{formatCoords(inc.coords)}</td>
                <td className="tabular py-2 text-text-muted">{formatDateTime(inc.detectedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
