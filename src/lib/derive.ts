import type { Buoy, Incident, Species, Zone, DetectionRow } from "./types";
import { needsHumanReview } from "./ranking";

/** Server-side derivations over the fixtures. Kept pure so routes can compute
 *  them and pass plain arrays into client chart components. */

const DAY = 86_400_000;

export interface TrendPoint {
  date: string; // 'DD MMM'
  plastic: number;
  ghost_net: number;
  bleaching: number;
  dumping: number;
  species_alert: number;
}

/** Detections bucketed by day and type over the last `days` days. */
export function detectionTrend(incidents: Incident[], days = 14, now = Date.now()): TrendPoint[] {
  const start = now - (days - 1) * DAY;
  const buckets: TrendPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start + i * DAY);
    buckets.push({
      date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }),
      plastic: 0,
      ghost_net: 0,
      bleaching: 0,
      dumping: 0,
      species_alert: 0,
    });
  }
  for (const inc of incidents) {
    const t = new Date(inc.detectedAt).getTime();
    const idx = Math.floor((t - start) / DAY);
    if (idx >= 0 && idx < days) buckets[idx][inc.type] += 1;
  }
  return buckets;
}

export function recentDetections(incidents: Incident[], n = 5): DetectionRow[] {
  return [...incidents]
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
    .slice(0, n)
    .map((i) => ({
      id: i.id,
      type: i.type,
      zoneId: i.zoneId,
      confidence: i.ai.confidence,
      detectedAt: i.detectedAt,
      imageKey: i.imageKey,
    }));
}

export interface Kpi {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaGood?: "up" | "down";
  spark?: number[];
}

/** A tiny deterministic sparkline series that ends at `end`. */
function sparkTo(end: number, seed: number, len = 10): number[] {
  const out: number[] = [];
  let v = end * 0.7;
  for (let i = 0; i < len; i++) {
    const wob = Math.sin((i + seed) * 1.3) * (end * 0.06);
    v += (end - v) * 0.18 + wob;
    out.push(Math.max(0, Math.round(v)));
  }
  out[len - 1] = end;
  return out;
}

export function dashboardKpis(
  incidents: Incident[],
  zones: Zone[],
  species: Species[],
): Kpi[] {
  const active = incidents.filter((i) => i.status !== "resolved").length;
  const zonesAtRisk = zones.filter((z) => z.riskScore >= 34).length;
  const monitored = species.length;
  const review = incidents.filter((i) => needsHumanReview(i)).length;
  return [
    {
      label: "Active incidents",
      value: active,
      delta: 5,
      deltaGood: "down",
      spark: sparkTo(active, 1),
    },
    {
      label: "Zones at risk",
      value: zonesAtRisk,
      unit: `/ ${zones.length}`,
      delta: 1,
      deltaGood: "down",
      spark: sparkTo(zonesAtRisk, 3),
    },
    {
      label: "Species monitored",
      value: monitored,
      delta: 2,
      deltaGood: "up",
      spark: sparkTo(monitored, 5),
    },
    {
      label: "Awaiting review",
      value: review,
      unit: "< 70%",
      delta: -2,
      deltaGood: "down",
      spark: sparkTo(review, 7),
    },
  ];
}

/** Buoy fleet health summary for the dashboard/status strip. */
export function fleetHealth(buoys: Buoy[]) {
  return {
    online: buoys.filter((b) => b.status === "online").length,
    degraded: buoys.filter((b) => b.status === "degraded").length,
    offline: buoys.filter((b) => b.status === "offline").length,
    total: buoys.length,
  };
}
