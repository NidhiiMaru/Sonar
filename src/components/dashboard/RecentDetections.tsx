import Image from "next/image";
import type { DetectionRow, Zone } from "@/lib/types";
import { INCIDENT_TYPE_META } from "@/lib/ui-meta";
import { ConfidenceChip } from "@/components/ui/ConfidenceChip";
import { getImage } from "@/lib/images";
import { timeAgo } from "@/lib/utils";

/** Compact recent-detections readout. A real table on md+, cards on mobile. */
export function RecentDetections({ rows, zones }: { rows: DetectionRow[]; zones: Zone[] }) {
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? id;

  return (
    <div>
      {/* mobile: stacked */}
      <ul className="flex flex-col divide-y divide-line md:hidden">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3 py-2.5">
            <Thumb imageKey={r.imageKey} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">
                {INCIDENT_TYPE_META[r.type].label}
              </p>
              <p className="truncate text-xs text-text-dim">
                {zoneName(r.zoneId)} · {timeAgo(r.detectedAt)}
              </p>
            </div>
            <ConfidenceChip value={r.confidence} compact />
          </li>
        ))}
      </ul>

      {/* md+: table */}
      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-text-dim">
            <th scope="col" className="py-2 pr-3 font-medium">Detection</th>
            <th scope="col" className="py-2 pr-3 font-medium">Type</th>
            <th scope="col" className="py-2 pr-3 font-medium">Zone</th>
            <th scope="col" className="py-2 pr-3 font-medium">Confidence</th>
            <th scope="col" className="py-2 font-medium">When</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="py-2 pr-3">
                <div className="flex items-center gap-2">
                  <Thumb imageKey={r.imageKey} />
                  <span className="tabular text-xs text-text-dim">{r.id}</span>
                </div>
              </td>
              <td className="py-2 pr-3 text-text">{INCIDENT_TYPE_META[r.type].label}</td>
              <td className="py-2 pr-3 text-text-muted">{zoneName(r.zoneId)}</td>
              <td className="py-2 pr-3"><ConfidenceChip value={r.confidence} compact /></td>
              <td className="tabular py-2 text-text-muted">{timeAgo(r.detectedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Thumb({ imageKey }: { imageKey: string }) {
  const img = getImage(imageKey);
  return (
    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-abyss">
      <Image src={img.src} alt="" fill sizes="36px" className="object-cover" />
    </span>
  );
}
