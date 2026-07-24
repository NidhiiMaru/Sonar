import { getBuoys, getIncidents, getSpecies, getVessels, getZones } from "@/adapters";
import { sortByRank } from "@/lib/ranking";
import { dashboardKpis, detectionTrend, fleetHealth, recentDetections } from "@/lib/derive";
import { pageMetadata } from "@/lib/metadata";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { KpiTile } from "@/components/ui/KpiTile";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { LiveDot } from "@/components/ui/LiveDot";
import { TrendChart } from "@/components/charts/TrendChart";
import { TriageQueue } from "@/components/dashboard/TriageQueue";
import { MiniMap } from "@/components/dashboard/MiniMap";
import { RecentDetections } from "@/components/dashboard/RecentDetections";
import { JsonLd, datasetLd } from "@/components/seo/JsonLd";
import { TilePreconnect } from "@/components/map/TilePreconnect";
import { ConsoleTelemetryTicker } from "@/components/dashboard/ConsoleTelemetryTicker";

export const metadata = pageMetadata({
  title: "Console — Sonar",
  description:
    "Live operating picture of deep-ocean health: active incidents, zones at risk, and an AI-ranked triage queue with confidence scores.",
  path: "/dashboard",
});

export default async function DashboardPage() {
  const [incidents, zones, species, buoys, vessels] = await Promise.all([
    getIncidents(),
    getZones(),
    getSpecies(),
    getBuoys(),
    getVessels(),
  ]);

  const ranked = sortByRank(incidents, zones);
  const kpis = dashboardKpis(incidents, zones, species);
  const trend = detectionTrend(incidents, 14);
  const recent = recentDetections(incidents, 6);
  const fleet = fleetHealth(buoys);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd data={datasetLd} />
      <TilePreconnect />
      <ConsoleTelemetryTicker />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          as="h1"
          eyebrow="Console"
          title="The operating picture"
        />
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <LiveDot label="Live" />
          <span className="tabular">
            Buoy fleet: <span className="text-bio">{fleet.online} online</span>
            {fleet.degraded > 0 && <span className="text-warn"> · {fleet.degraded} degraded</span>}
            {fleet.offline > 0 && <span className="text-alert"> · {fleet.offline} offline</span>}
          </span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiTile key={k.label} {...k} />
        ))}
      </div>

      {/* map + triage queue */}
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* On mobile the triage queue is the primary surface and paints first
            (text LCP); the external map tiles never land in the first viewport. */}
        <Panel className="order-2 flex flex-col lg:order-1 lg:col-span-3">
          <PanelHeader
            title="Live threat map"
            action={<span className="text-xs text-text-dim">{incidents.length} incidents</span>}
          />
          <div className="p-3 pb-3">
            <div className="h-[340px]">
              <MiniMap incidents={incidents} zones={zones} />
            </div>
          </div>
        </Panel>

        <div className="order-1 lg:order-2 lg:col-span-2">
          <TriageQueue incidents={ranked.slice(0, 6)} zones={zones} vessels={vessels} />
        </div>
      </div>

      {/* trend + recent */}
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <PanelHeader
            title="Detections — last 14 days"
            action={<span className="text-xs text-text-dim">stacked by type</span>}
          />
          <PanelBody>
            <TrendChart data={trend} />
          </PanelBody>
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelHeader title="Recent detections" />
          <PanelBody>
            <RecentDetections rows={recent} zones={zones} />
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
