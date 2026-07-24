import { Info } from "lucide-react";
import type { ForecastPoint, Zone } from "@/lib/types";
import { riskToSeverity } from "@/lib/ui-meta";
import { ForecastChart } from "@/components/charts/ForecastChart";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { KpiTile } from "@/components/ui/KpiTile";
import { EmptyState } from "@/components/ui/EmptyState";
import { bandConfidence, shortDay, type Horizon } from "./forecast-utils";

/**
 * The headline chart: predicted risk line plus its confidence band for the
 * selected zone and horizon. Colour of the zone's severity badge and the KPIs
 * frame the chart; a plain-language legend + end-of-horizon note make the
 * band's meaning explicit (it widens the further out we predict).
 */
export function RiskBandPanel({
  zone,
  points,
  horizon,
}: {
  zone: Zone;
  points: ForecastPoint[];
  horizon: Horizon;
}) {
  const severity = riskToSeverity(zone.riskScore);
  const first = points[0];
  const last = points[points.length - 1];
  const confidence = bandConfidence(points);

  return (
    <Panel as="section" aria-labelledby="riskband-heading">
      <PanelHeader
        id="riskband-heading"
        title={
          <span className="flex items-center gap-2">
            <span className="text-text">{zone.name}</span>
            <span className="tabular text-xs font-normal text-text-dim">{zone.id}</span>
          </span>
        }
        action={<SeverityBadge level={severity} />}
      />
      <PanelBody className="flex flex-col gap-5">
        {points.length === 0 || !first || !last ? (
          <EmptyState
            title="No forecast for this zone"
            hint="Pick another zone from the control above."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <KpiTile
                label="Risk now"
                value={first.risk}
                delta={zone.riskDelta}
                deltaGood="down"
              />
              <KpiTile label={`Risk in ${horizon} days`} value={last.risk} />
              <KpiTile label="Forecast confidence" value={`${confidence}%`} />
            </div>

            <ForecastChart points={points} />

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-muted">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="h-0.5 w-6 rounded-full bg-glow" />
                  Solid line = predicted risk
                </span>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="h-3 w-6 rounded-sm bg-glow/20" />
                  Shaded = confidence interval (widens with horizon)
                </span>
              </div>

              <p className="flex items-start gap-2 text-sm text-text-muted">
                <Info size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-glow" />
                <span>
                  By <span className="text-text">{shortDay(last.t)}</span>, predicted risk is{" "}
                  <span className="tabular font-semibold text-text">{last.risk}</span>{" "}
                  (band{" "}
                  <span className="tabular">
                    {last.lower}–{last.upper}
                  </span>
                  ). The band widens the further out we predict — later days carry more
                  uncertainty, so treat distant values as direction, not precision.
                </span>
              </p>
            </div>
          </>
        )}
      </PanelBody>
    </Panel>
  );
}
