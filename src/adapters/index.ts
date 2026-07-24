import { z } from "zod";
import type {
  Buoy,
  ForecastPoint,
  Incident,
  Species,
  Vessel,
  Zone,
  ZoneForecast,
} from "@/lib/types";
import {
  buoySchema,
  forecastSchema,
  incidentSchema,
  speciesSchema,
  vesselSchema,
  zoneSchema,
} from "./schemas";

import incidentsFixture from "@/fixtures/incidents.json";
import zonesFixture from "@/fixtures/zones.json";
import speciesFixture from "@/fixtures/species.json";
import buoysFixture from "@/fixtures/buoys.json";
import vesselsFixture from "@/fixtures/vessels.json";
import forecastFixture from "@/fixtures/forecast.json";

/**
 * Typed adapters. Each one reads its local fixture, validates it against the
 * zod contract, and returns typed data after a small artificial delay so the
 * skeletons in the UI are real and demoable. Swap the fixture read for the
 * `fetch` in the TODO(live) comment and nothing downstream changes — that is
 * the point of the "wired for live data on day one" claim.
 */

const LATENCY = 55;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function validate<T>(schema: z.ZodType<T>, data: unknown, label: string): T[] {
  const parsed = z.array(schema).safeParse(data);
  if (!parsed.success) {
    throw new Error(`Fixture validation failed for ${label}: ${parsed.error.message}`);
  }
  return parsed.data;
}

// TODO(live): GET https://gis.oceanexplorer.noaa.gov/... (synthetic ROV/sonar detections; no public equivalent)
export async function getIncidents(): Promise<Incident[]> {
  await delay(LATENCY);
  return validate(incidentSchema, incidentsFixture, "incidents") as Incident[];
}

// TODO(live): Copernicus Marine — SST anomaly & zone risk grids (marine.copernicus.eu)
export async function getZones(): Promise<Zone[]> {
  await delay(LATENCY);
  return validate(zoneSchema, zonesFixture, "zones") as Zone[];
}

// TODO(live): GBIF Occurrence API — https://api.gbif.org/v1/occurrence/search
export async function getSpecies(): Promise<Species[]> {
  await delay(LATENCY);
  return validate(speciesSchema, speciesFixture, "species") as Species[];
}

// TODO(live): Argo floats / Copernicus Marine — buoy SST, pH, turbidity time series
export async function getBuoys(): Promise<Buoy[]> {
  await delay(LATENCY);
  return validate(buoySchema, buoysFixture, "buoys") as Buoy[];
}

// TODO(live): Global Fishing Watch — vessel positions (globalfishingwatch.org/our-apis)
export async function getVessels(): Promise<Vessel[]> {
  await delay(LATENCY);
  return validate(vesselSchema, vesselsFixture, "vessels") as Vessel[];
}

// TODO(live): Copernicus Marine forecast product — per-zone risk with CI band
export async function getForecasts(): Promise<ZoneForecast[]> {
  await delay(LATENCY);
  const parsed = validate(forecastSchema, forecastFixture, "forecast");
  // horizon is derived, not stored — a 30-day series is sliced to 7 or 30 in the UI
  return parsed.map((f) => ({
    zoneId: f.zoneId,
    horizon: 30 as const,
    points: f.points as ForecastPoint[],
  }));
}
