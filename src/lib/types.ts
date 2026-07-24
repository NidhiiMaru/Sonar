/**
 * Sonar — domain types
 *
 * Fake data, real shapes. Every fixture is shaped 1:1 like the open API it
 * stands in for and validated by a zod schema in src/adapters before use.
 */

export type Severity = "low" | "medium" | "high";

export type IncidentType =
  | "plastic"
  | "ghost_net"
  | "bleaching"
  | "dumping"
  | "species_alert";

export type IncidentStatus = "new" | "assigned" | "resolved";

export type SourceKind = "auv" | "sonar" | "satellite" | "buoy" | "citizen";

export type IucnStatus = "LC" | "NT" | "VU" | "EN" | "CR" | "DD";

export type PopulationTrend = "increasing" | "stable" | "decreasing";

export interface AiVerdict {
  label: string; // 'Ghost net'
  confidence: number; // 0.62..0.97 — NEVER 1.0
  modelVersion: string; // 'dsg-detect-v2.1'
  inferredAt: string; // ISO
  evidenceFrame: string; // human description of the source frame
  rationale: string; // one human sentence
}

export interface Incident {
  id: string; // 'INC-2026-0412'
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  zoneId: string;
  coords: [number, number]; // [lat, lng]
  detectedAt: string; // ISO
  source: SourceKind;
  imageKey: string; // -> public/images/... via IMAGE_MAP
  ai: AiVerdict;
  rank: number; // computed, see 04-MOCK-DATA §4
  recommendedAction: string;
  assignedTo?: string; // vesselId
}

export interface ZoneDrivers {
  sstAnomaly: number; // °C anomaly
  drift: number; // current drift, 0..100 index
  vesselTraffic: number; // 0..100 index
  history: number; // historical incident load, 0..100 index
}

export interface Zone {
  id: string; // 'Z-04'
  name: string; // 'Mariana Rim'
  polygon: [number, number][]; // [lat, lng][]
  centroid: [number, number];
  riskScore: number; // 0..100
  riskDelta: number; // vs last week
  biodiversityIndex: number; // 0..100
  drivers: ZoneDrivers;
}

export interface Species {
  id: string;
  slug: string;
  commonName: string;
  scientificName: string;
  iucn: IucnStatus;
  populationTrend: PopulationTrend;
  trendSeries: number[]; // 12 points
  zoneIds: string[];
  imageKey: string;
  depthRange: [number, number]; // metres
  blurb: string; // 1-2 sentences, factual
}

export interface BuoyReading {
  t: string; // ISO
  sst: number; // °C
  ph: number;
  turbidity: number; // NTU
}

export interface Buoy {
  id: string;
  zoneId: string;
  coords: [number, number];
  readings: BuoyReading[];
  status: "online" | "degraded" | "offline";
}

export interface Vessel {
  id: string;
  name: string; // 'RV Meridian'
  org: string;
  coords: [number, number];
  status: "available" | "dispatched";
  etaMinutes?: number;
}

export interface ForecastPoint {
  t: string; // ISO day
  risk: number; // 0..100
  lower: number; // CI lower bound
  upper: number; // CI upper bound
}

export interface ZoneForecast {
  zoneId: string;
  horizon: 7 | 30;
  points: ForecastPoint[];
}

/** Recent-detection table rows (dashboard) — a projection over incidents. */
export interface DetectionRow {
  id: string;
  type: IncidentType;
  zoneId: string;
  confidence: number;
  detectedAt: string;
  imageKey: string;
}

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export const INCIDENT_TYPE_LABEL: Record<IncidentType, string> = {
  plastic: "Plastic debris",
  ghost_net: "Ghost net",
  bleaching: "Coral bleaching",
  dumping: "Illegal dumping",
  species_alert: "Species alert",
};

export const IUCN_LABEL: Record<IucnStatus, string> = {
  LC: "Least Concern",
  NT: "Near Threatened",
  VU: "Vulnerable",
  EN: "Endangered",
  CR: "Critically Endangered",
  DD: "Data Deficient",
};

export const SOURCE_LABEL: Record<SourceKind, string> = {
  auv: "AUV / ROV",
  sonar: "Sonar",
  satellite: "Satellite",
  buoy: "IoT buoy",
  citizen: "Citizen report",
};
