import { Suspense } from "react";
import { getIncidents, getVessels, getZones } from "@/adapters";
import { sortByRank } from "@/lib/ranking";
import { pageMetadata } from "@/lib/metadata";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Panel, PanelBody } from "@/components/ui/Panel";
import { Skeleton } from "@/components/ui/Skeleton";
import { AlertsBoard } from "@/components/alerts/AlertsBoard";

export const metadata = pageMetadata({
  title: "Alerts & Dispatch — Sonar",
  description:
    "Triage deep-ocean incidents by severity and confidence, assign response vessels, and export evidence packs.",
  path: "/alerts",
});

export default async function AlertsPage() {
  const [incidents, zones, vessels] = await Promise.all([getIncidents(), getZones(), getVessels()]);
  const ranked = sortByRank(incidents, zones);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <SectionHeading
          as="h1"
          eyebrow="Triage & dispatch"
          title="Alerts queue"
          lede="Every incident, ranked by severity × confidence × ecological value. Assign the nearest vessel, then export an auditable evidence pack."
        />
      </div>

      <Panel>
        <PanelBody>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <AlertsBoard incidents={ranked} zones={zones} vessels={vessels} />
          </Suspense>
        </PanelBody>
      </Panel>
    </div>
  );
}
