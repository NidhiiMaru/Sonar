import type { ForecastPoint, Severity, Zone, ZoneForecast } from "@/lib/types";

/** The two supported forecast windows. A 30-day series is sliced to 7 or 30. */
export type Horizon = 7 | 30;

/** Parse the `horizon` search param — anything but "7" falls back to 30. */
export function parseHorizon(v: string | string[] | undefined): Horizon {
  return v === "7" ? 7 : 30;
}

/** Resolve the active zone from the `zone` search param, defaulting to the
 *  highest-risk zone so the page always opens on the thing that matters most. */
export function resolveActiveZone(
  zones: Zone[],
  zoneParam: string | string[] | undefined,
): Zone {
  const wanted = Array.isArray(zoneParam) ? zoneParam[0] : zoneParam;
  const match = wanted ? zones.find((z) => z.id === wanted) : undefined;
  if (match) return match;
  return zones.reduce((top, z) => (z.riskScore > top.riskScore ? z : top), zones[0]);
}

/** Slice the stored 30-point series down to the requested window. */
export function sliceHorizon(points: ForecastPoint[], horizon: Horizon): ForecastPoint[] {
  return points.slice(0, horizon);
}

/** Mean confidence-interval width across the window (widens with horizon). */
export function avgBandWidth(points: ForecastPoint[]): number {
  if (points.length === 0) return 0;
  const sum = points.reduce((acc, p) => acc + (p.upper - p.lower), 0);
  return sum / points.length;
}

/** Confidence proxy: a narrower band means a more confident forecast.
 *  Derived from the mean band width over the window, clamped to 0..100. */
export function bandConfidence(points: ForecastPoint[]): number {
  const c = 100 - avgBandWidth(points);
  return Math.max(0, Math.min(100, Math.round(c)));
}

/** Look up a zone's forecast, tolerant of missing data. */
export function forecastFor(
  forecasts: ZoneForecast[],
  zoneId: string,
): ZoneForecast | undefined {
  return forecasts.find((f) => f.zoneId === zoneId);
}

/** Short operational recommendation derived from the severity band. */
export function recommendedAction(severity: Severity): string {
  switch (severity) {
    case "high":
      return "Dispatch survey + thermal watch";
    case "medium":
      return "Monitor; stage response";
    case "low":
      return "Routine watch";
  }
}

/** "22 Aug" — compact UTC day label for horizon copy. */
export function shortDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}
