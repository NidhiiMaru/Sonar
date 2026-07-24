import { History, Ship, ThermometerSun, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Zone } from "@/lib/types";
import { riskToSeverity, SEVERITY_META } from "@/lib/ui-meta";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { cn } from "@/lib/utils";

interface DriverRow {
  icon: LucideIcon;
  label: string;
  /** Bar fill 0..100 — the normalised contribution. */
  percent: number;
  /** Human-readable measured value (e.g. "2.3 °C" or "88 / 100"). */
  display: string;
  /** One line on why this driver pushes risk up. */
  why: string;
}

/**
 * Explainable-AI panel. The four inputs that feed a zone's risk score, each
 * rendered as a horizontal contribution bar. Bar magnitude is colour-coded by
 * severity AND carries a numeric value + a labelled SeverityBadge, so the
 * story survives greyscale and reads as a genuine "here is why" breakdown.
 */
export function DriversPanel({ zone }: { zone: Zone }) {
  const d = zone.drivers;
  // SST anomaly is a °C figure; normalise against a +3 °C reference to a 0..100
  // contribution. The other three are already 0..100 indices.
  const sstPercent = Math.min(100, Math.round((d.sstAnomaly / 3) * 100));

  const rows: DriverRow[] = [
    {
      icon: ThermometerSun,
      label: "SST anomaly",
      percent: sstPercent,
      display: `+${d.sstAnomaly.toFixed(1)} °C`,
      why: "Warmer-than-normal water stresses reefs and shifts species — the strongest bleaching signal.",
    },
    {
      icon: Waves,
      label: "Current drift",
      percent: Math.round(d.drift),
      display: `${d.drift} / 100`,
      why: "Faster drift concentrates debris and carries pollutants into the zone.",
    },
    {
      icon: Ship,
      label: "Vessel traffic",
      percent: Math.round(d.vesselTraffic),
      display: `${d.vesselTraffic} / 100`,
      why: "Dense shipping raises the odds of ghost gear, dumping and strikes.",
    },
    {
      icon: History,
      label: "Historical incidents",
      percent: Math.round(d.history),
      display: `${d.history} / 100`,
      why: "Zones with a heavy incident record tend to keep offending.",
    },
  ];

  return (
    <Panel as="section" aria-labelledby="drivers-heading">
      <PanelHeader id="drivers-heading" title="Why this forecast — risk drivers" />
      <PanelBody className="flex flex-col gap-5">
        <p className="max-w-[70ch] text-sm text-text-muted">
          The risk score is computed from these four drivers — a zone with high SST
          anomaly and vessel traffic scores high by construction. Longer, brighter
          bars are the factors doing the most work.
        </p>

        <ul className="flex flex-col gap-4">
          {rows.map((row) => {
            const severity = riskToSeverity(row.percent);
            const meta = SEVERITY_META[severity];
            const Icon = row.icon;
            return (
              <li key={row.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-text">
                    <Icon size={16} aria-hidden="true" className={meta.text} />
                    <span>{row.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("tabular text-sm font-semibold", meta.text)}>
                      {row.display}
                    </span>
                    <SeverityBadge level={severity} />
                  </div>
                </div>
                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2"
                  role="meter"
                  aria-label={`${row.label} contribution`}
                  aria-valuenow={row.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={cn("h-full rounded-full", meta.bg)}
                    style={{ width: `${Math.max(4, row.percent)}%` }}
                  />
                </div>
                <p className="text-xs text-text-dim">{row.why}</p>
              </li>
            );
          })}
        </ul>
      </PanelBody>
    </Panel>
  );
}
