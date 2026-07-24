import { z } from "zod";

/** zod schemas — the runtime contract every fixture is validated against
 *  before it reaches a component. Shapes mirror the open APIs. */

const coords = z.tuple([z.number(), z.number()]);

export const severitySchema = z.enum(["low", "medium", "high"]);
export const incidentTypeSchema = z.enum([
  "plastic",
  "ghost_net",
  "bleaching",
  "dumping",
  "species_alert",
]);

export const aiVerdictSchema = z.object({
  label: z.string(),
  confidence: z.number().min(0).max(0.999), // never 1.0
  modelVersion: z.string(),
  inferredAt: z.string(),
  evidenceFrame: z.string(),
  rationale: z.string(),
});

export const incidentSchema = z.object({
  id: z.string(),
  type: incidentTypeSchema,
  severity: severitySchema,
  status: z.enum(["new", "assigned", "resolved"]),
  zoneId: z.string(),
  coords,
  detectedAt: z.string(),
  source: z.enum(["auv", "sonar", "satellite", "buoy", "citizen"]),
  imageKey: z.string(),
  ai: aiVerdictSchema,
  rank: z.number(),
  recommendedAction: z.string(),
  assignedTo: z.string().optional(),
});

export const zoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  polygon: z.array(coords),
  centroid: coords,
  riskScore: z.number(),
  riskDelta: z.number(),
  biodiversityIndex: z.number(),
  drivers: z.object({
    sstAnomaly: z.number(),
    drift: z.number(),
    vesselTraffic: z.number(),
    history: z.number(),
  }),
});

export const speciesSchema = z.object({
  id: z.string(),
  slug: z.string(),
  commonName: z.string(),
  scientificName: z.string(),
  iucn: z.enum(["LC", "NT", "VU", "EN", "CR", "DD"]),
  populationTrend: z.enum(["increasing", "stable", "decreasing"]),
  trendSeries: z.array(z.number()),
  zoneIds: z.array(z.string()),
  imageKey: z.string(),
  depthRange: z.tuple([z.number(), z.number()]),
  blurb: z.string(),
});

export const buoySchema = z.object({
  id: z.string(),
  zoneId: z.string(),
  coords,
  status: z.enum(["online", "degraded", "offline"]),
  readings: z.array(
    z.object({ t: z.string(), sst: z.number(), ph: z.number(), turbidity: z.number() }),
  ),
});

export const vesselSchema = z.object({
  id: z.string(),
  name: z.string(),
  org: z.string(),
  coords,
  status: z.enum(["available", "dispatched"]),
  etaMinutes: z.number().optional(),
});

export const forecastSchema = z.object({
  zoneId: z.string(),
  points: z.array(
    z.object({ t: z.string(), risk: z.number(), lower: z.number(), upper: z.number() }),
  ),
});
