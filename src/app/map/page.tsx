import { getIncidents, getVessels, getZones } from "@/adapters";
import type { Incident, IncidentType, Severity } from "@/lib/types";
import { pageMetadata } from "@/lib/metadata";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/Panel";
import { MapFilterBar } from "@/components/map/MapFilterBar";
import { MapExplorer } from "@/components/map/MapExplorer";
import { IncidentTable } from "@/components/map/IncidentTable";
import { TilePreconnect } from "@/components/map/TilePreconnect";

export const metadata = pageMetadata({
  title: "Live Threat Map — Sonar",
  description:
    "Explore deep-ocean incidents by severity, type and zone: plastic clusters, ghost nets, illegal dumping and coral bleaching.",
  path: "/map",
});

const DAY = 86_400_000;

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ severity?: string; type?: string; zone?: string; window?: string }>;
}) {
  const sp = await searchParams;
  const [incidents, zones, vessels] = await Promise.all([getIncidents(), getZones(), getVessels()]);

  const now = Date.now();
  const filtered = incidents.filter((inc: Incident) => {
    if (sp.severity && inc.severity !== (sp.severity as Severity)) return false;
    if (sp.type && inc.type !== (sp.type as IncidentType)) return false;
    if (sp.zone && inc.zoneId !== sp.zone) return false;
    if (sp.window && sp.window !== "all") {
      const days = Number(sp.window);
      if (!Number.isNaN(days) && new Date(inc.detectedAt).getTime() < now - days * DAY) return false;
    }
    return true;
  });

  // A couple of synthetic AUV survey tracks around the two busiest zones.
  const busiest = [...zones].sort((a, b) => b.riskScore - a.riskScore).slice(0, 2);
  const tracks: [number, number][][] = busiest.map((z) => {
    const [lat, lng] = z.centroid;
    return [
      [lat - 1.1, lng - 1.2],
      [lat - 0.4, lng - 0.3],
      [lat + 0.3, lng + 0.5],
      [lat + 1.0, lng + 1.3],
    ];
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <TilePreconnect />
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading as="h1" eyebrow="Live map" title="Deep-ocean threat map" />
        <p className="tabular text-sm text-text-muted">
          <span className="font-semibold text-text">{filtered.length}</span> of {incidents.length} incidents
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <MapFilterBar zones={zones} />
        <MapExplorer incidents={filtered} zones={zones} vessels={vessels} tracks={tracks} />

        <Panel>
          <PanelHeader
            title="Incident register"
            action={<span className="text-xs text-text-dim">Accessible equivalent of the map</span>}
          />
          <PanelBody>
            <IncidentTable incidents={filtered} zones={zones} />
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
