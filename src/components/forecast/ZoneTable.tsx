import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { Zone, ZoneForecast } from "@/lib/types";
import { riskToSeverity } from "@/lib/ui-meta";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { cn } from "@/lib/utils";
import {
  bandConfidence,
  forecastFor,
  recommendedAction,
  sliceHorizon,
  type Horizon,
} from "./forecast-utils";

interface Row {
  zone: Zone;
  confidence: number;
  action: string;
  severity: ReturnType<typeof riskToSeverity>;
  active: boolean;
  href: string;
}

function DeltaCell({ delta }: { delta: number }) {
  // Rising risk is bad: positive delta → alert, negative → bio, flat → dim.
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
  const color = delta > 0 ? "text-alert" : delta < 0 ? "text-bio" : "text-text-dim";
  return (
    <span className={cn("tabular inline-flex items-center gap-1 text-sm font-medium", color)}>
      <Icon size={14} aria-hidden="true" />
      {delta > 0 ? "+" : ""}
      {delta}
    </span>
  );
}

/**
 * All zones at a glance. Real <table> from md up; stacked cards below so
 * nothing scrolls sideways at 360px. Every row/card is a Link that sets
 * ?zone= (keeping the current horizon) to drive the panels above.
 */
export function ZoneTable({
  zones,
  forecasts,
  activeZoneId,
  horizon,
}: {
  zones: Zone[];
  forecasts: ZoneForecast[];
  activeZoneId: string;
  horizon: Horizon;
}) {
  const rows: Row[] = zones.map((zone) => {
    const fc = forecastFor(forecasts, zone.id);
    const window = fc ? sliceHorizon(fc.points, horizon) : [];
    const severity = riskToSeverity(zone.riskScore);
    return {
      zone,
      confidence: window.length ? bandConfidence(window) : 0,
      action: recommendedAction(severity),
      severity,
      active: zone.id === activeZoneId,
      href: `/forecast?zone=${zone.id}&horizon=${horizon}`,
    };
  });

  return (
    <Panel as="section" aria-labelledby="zones-heading">
      <PanelHeader id="zones-heading" title={`All zones · ${horizon}-day confidence`} />
      <PanelBody>
        {/* Desktop / tablet: semantic table */}
        <div className="hidden md:block">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Predicted risk, weekly change, forecast confidence and recommended action
              for every monitored zone.
            </caption>
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-text-muted">
                <th scope="col" className="py-2 pr-4 font-medium">Zone</th>
                <th scope="col" className="py-2 pr-4 font-medium">Risk</th>
                <th scope="col" className="py-2 pr-4 font-medium">Δ vs last week</th>
                <th scope="col" className="py-2 pr-4 font-medium">Confidence</th>
                <th scope="col" className="py-2 font-medium">Recommended action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ zone, confidence, action, severity, active, href }) => (
                <tr
                  key={zone.id}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "border-b border-line/60 transition-colors last:border-0 hover:bg-surface-2/50",
                    active && "bg-surface-2",
                  )}
                >
                  <th scope="row" className="py-3 pr-4 text-left font-normal">
                    <Link
                      href={href}
                      scroll={false}
                      className="group inline-flex flex-col rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
                    >
                      <span className="font-medium text-text group-hover:text-glow">
                        {zone.name}
                      </span>
                      <span className="tabular text-xs text-text-dim">{zone.id}</span>
                    </Link>
                  </th>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-2">
                      <SeverityBadge level={severity} />
                      <span className="tabular font-semibold text-text">{zone.riskScore}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <DeltaCell delta={zone.riskDelta} />
                  </td>
                  <td className="py-3 pr-4">
                    <span className="tabular text-text">{confidence}%</span>
                  </td>
                  <td className="py-3 text-text-muted">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: stacked cards, never a sideways-scrolling table */}
        <ul className="flex flex-col gap-3 md:hidden">
          {rows.map(({ zone, confidence, action, severity, active, href }) => (
            <li key={zone.id}>
              <Link
                href={href}
                scroll={false}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex flex-col gap-3 rounded-[var(--radius-md)] border border-line bg-surface-2/40 p-4",
                  "transition-colors hover:border-line-bright",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow",
                  active && "border-glow/50 bg-surface-2",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-text">{zone.name}</span>
                    <span className="tabular text-xs text-text-dim">{zone.id}</span>
                  </div>
                  <SeverityBadge level={severity} />
                </div>
                <dl className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-text-dim">Risk</dt>
                    <dd className="tabular font-semibold text-text">{zone.riskScore}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-text-dim">Δ / week</dt>
                    <dd>
                      <DeltaCell delta={zone.riskDelta} />
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-text-dim">Confidence</dt>
                    <dd className="tabular text-text">{confidence}%</dd>
                  </div>
                </dl>
                <p className="text-xs text-text-muted">
                  <span className="text-text-dim">Action: </span>
                  {action}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </PanelBody>
    </Panel>
  );
}
