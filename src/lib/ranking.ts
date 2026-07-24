import { SEVERITY_WEIGHT, type Incident, type Zone } from "./types";

/**
 * The one ranking formula for the whole product.
 *
 *   rank = severityWeight(3/2/1) × confidence × (zone biodiversity index / 100)
 *
 * This function is the single source of truth. The triage queue sorts by it,
 * the "How this is ranked" popover renders it, and the fixture generator uses
 * it — so what a judge reads on screen always matches how the list is ordered.
 */
export function rankIncident(
  incident: Pick<Incident, "severity" | "ai">,
  zoneBiodiversityIndex: number,
): number {
  const w = SEVERITY_WEIGHT[incident.severity];
  return w * incident.ai.confidence * (zoneBiodiversityIndex / 100);
}

export const RANKING_FORMULA = "severity × confidence × ecological value";

export const RANKING_EXPLAINER =
  "Each incident is scored by severity weight (high 3 · medium 2 · low 1), " +
  "multiplied by the AI's confidence, multiplied by the ecological value of " +
  "its zone (biodiversity index ÷ 100). The queue is sorted by that score, " +
  "highest first — so a confident, high-severity detection in a biodiverse " +
  "zone rises above an uncertain one in open water.";

/** Sort a set of incidents by live-computed rank, highest first. */
export function sortByRank(
  incidents: Incident[],
  zones: Zone[],
): Incident[] {
  const bio = new Map(zones.map((z) => [z.id, z.biodiversityIndex]));
  return [...incidents]
    .map((inc) => ({
      inc,
      score: rankIncident(inc, bio.get(inc.zoneId) ?? 50),
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.inc);
}

/** An incident whose AI confidence is below this needs a human to confirm it. */
export const REVIEW_THRESHOLD = 0.7;

export function needsHumanReview(incident: Pick<Incident, "ai">): boolean {
  return incident.ai.confidence < REVIEW_THRESHOLD;
}
