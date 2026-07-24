import { getForecasts, getZones } from "@/adapters";
import { pageMetadata } from "@/lib/metadata";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JsonLd, datasetLd } from "@/components/seo/JsonLd";
import { ForecastControls } from "@/components/forecast/ForecastControls";
import { RiskBandPanel } from "@/components/forecast/RiskBandPanel";
import { DriversPanel } from "@/components/forecast/DriversPanel";
import { ZoneTable } from "@/components/forecast/ZoneTable";
import {
  forecastFor,
  parseHorizon,
  resolveActiveZone,
  sliceHorizon,
} from "@/components/forecast/forecast-utils";

export const metadata = pageMetadata({
  title: "Risk Forecast — Sonar",
  description:
    "7- and 30-day predictive environmental risk by ocean zone, with the drivers behind every forecast.",
  path: "/forecast",
});

export default async function ForecastPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { zone: zoneParam, horizon: horizonParam } = await searchParams;
  const [zones, forecasts] = await Promise.all([getZones(), getForecasts()]);

  const horizon = parseHorizon(horizonParam);
  const activeZone = resolveActiveZone(zones, zoneParam);
  const activeForecast = forecastFor(forecasts, activeZone.id);
  const slicedPoints = activeForecast
    ? sliceHorizon(activeForecast.points, horizon)
    : [];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Prediction"
        title="Risk Forecast"
        lede="Per-zone predictive environmental risk over the next 7 or 30 days. Each forecast is a central estimate wrapped in a confidence band — and every score is traceable back to the drivers that produced it."
      />

      <ForecastControls
        zones={zones.map((z) => ({ id: z.id, name: z.name, riskScore: z.riskScore }))}
        horizon={horizon}
        activeZone={activeZone.id}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RiskBandPanel zone={activeZone} points={slicedPoints} horizon={horizon} />
        <DriversPanel zone={activeZone} />
      </div>

      <ZoneTable
        zones={zones}
        forecasts={forecasts}
        activeZoneId={activeZone.id}
        horizon={horizon}
      />

      <JsonLd data={datasetLd} />
    </div>
  );
}
